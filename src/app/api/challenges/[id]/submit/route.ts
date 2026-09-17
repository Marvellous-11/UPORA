import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import {
  evaluateSubmission,
  normalizeRubricCriteria,
  computeEvidenceHash,
} from "@/lib/challenges/evaluator";
import { advanceRoadmapOnVerification } from "@/lib/roadmap/progress";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const submitSchema = z.object({
  deliverableContent: z
    .string()
    .min(50, "Deliverable must be at least 50 characters of real work.")
    .max(50_000, "Deliverable is too large (max 50,000 characters)."),
});

/**
 * Submits a practical challenge deliverable. The submission is evaluated by
 * the deterministic UPORA rubric engine, persisted, and (on pass) upgrades the
 * related user skill to PROJECT_VERIFIED, creates a portfolio artifact, and
 * advances the active roadmap.
 */
export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to submit a challenge.");

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, parsed.error.errors[0]?.message || "Invalid submission.");
  }

  try {
    const challenge = await prisma.practicalChallenge.findUnique({
      where: { id },
      include: {
        learningModule: {
          include: { skill: { select: { id: true, slug: true, name: true } } },
        },
      },
    });

    if (!challenge) return apiError(404, "Challenge not found.");

    const previousAttempts = await prisma.projectSubmission.count({
      where: { challengeId: challenge.id, userId: user.userId },
    });
    const attemptNumber = previousAttempts + 1;

    const rubric = normalizeRubricCriteria(challenge.rubricCriteria);
    const evaluation = evaluateSubmission({
      deliverable: parsed.data.deliverableContent,
      rubric,
      passingScore: challenge.passingScore,
    });

    const evidenceHash = computeEvidenceHash({
      deliverable: parsed.data.deliverableContent,
      challengeId: challenge.id,
      userId: user.userId,
    });

    const status = evaluation.passed ? "PASSED" : "REJECTED";

    const submission = await prisma.$transaction(async (tx) => {
      const created = await tx.projectSubmission.create({
        data: {
          challengeId: challenge.id,
          userId: user.userId,
          submissionUrl: `urn:upora:submission:text:${evidenceHash.slice(0, 16)}`,
          deliverableContent: parsed.data.deliverableContent,
          status: status as "SUBMITTED" | "EVALUATING" | "PASSED" | "REJECTED",
          evaluationScore: evaluation.score,
          feedbackSummary: evaluation.summary,
          rubricBreakdown: {
            criteriaScores: evaluation.criteriaScores as unknown as Record<string, unknown>[],
            evidenceHash,
            evaluatorType: evaluation.evaluatorType,
          } as unknown as import("@prisma/client").Prisma.InputJsonValue,
          evaluatorType: evaluation.evaluatorType,
          attemptNumber,
        },
      });

      if (evaluation.passed) {
        const profile = await tx.profile.findUnique({ where: { userId: user.userId } });
        if (!profile) throw new Error("Profile not found.");

        const existing = await tx.userSkill.findUnique({
          where: {
            profileId_skillId: {
              profileId: profile.id,
              skillId: challenge.learningModule.skill.id,
            },
          },
        });

        const finalTier =
          existing?.tier === "CLIENT_VALIDATED" ? "CLIENT_VALIDATED" : "PROJECT_VERIFIED";

        await tx.userSkill.upsert({
          where: {
            profileId_skillId: {
              profileId: profile.id,
              skillId: challenge.learningModule.skill.id,
            },
          },
          update: {
            tier: finalTier,
            confidenceScore: evaluation.score,
            verifiedAt: new Date(),
            evidenceSubmissionId: created.id,
          },
          create: {
            profileId: profile.id,
            skillId: challenge.learningModule.skill.id,
            tier: finalTier,
            confidenceScore: evaluation.score,
            verifiedAt: new Date(),
            evidenceSubmissionId: created.id,
          },
        });

        const verifiedCount = await tx.userSkill.count({
          where: {
            profileId: profile.id,
            tier: { in: ["ASSESSED", "PROJECT_VERIFIED", "CLIENT_VALIDATED"] },
          },
        });

        await tx.profile.update({
          where: { id: profile.id },
          data: { verifiedSkillsCount: verifiedCount },
        });

        await tx.portfolioItem.create({
          data: {
            profileId: profile.id,
            submissionId: created.id,
            title: challenge.title,
            description: challenge.problemBrief,
            verifiedBadge: true,
          },
        });
      }

      return created;
    });

    if (evaluation.passed) {
      try {
        await advanceRoadmapOnVerification(user.userId);
      } catch (roadmapError) {
        console.error("Roadmap advancement failed (non-fatal):", roadmapError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: evaluation.passed
          ? "Submission evaluated and passed."
          : "Submission evaluated — below the passing threshold.",
        evaluation: {
          score: evaluation.score,
          passed: evaluation.passed,
          passingScore: evaluation.passingScore,
          summary: evaluation.summary,
          evidenceFound: evaluation.evidenceFound,
          specificImprovements: evaluation.specificImprovements,
          criteriaScores: evaluation.criteriaScores,
          evidenceHash,
          status,
        },
        submission: { id: submission.id, attemptNumber, status },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/challenges/[id]/submit error:", error);
    return apiError(500, "Failed to process submission. Please try again.");
  }
}