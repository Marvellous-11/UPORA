import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import { normalizeRubricCriteria } from "@/lib/challenges/evaluator";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Returns full challenge detail plus the caller's submission history. */
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  const { id } = await context.params;

  try {
    const challenge = await prisma.practicalChallenge.findUnique({
      where: { id },
      include: {
        learningModule: {
          include: { skill: { select: { slug: true, name: true, category: true } } },
        },
      },
    });

    if (!challenge) return apiError(404, "Challenge not found.");

    const submissions = user
      ? await prisma.projectSubmission.findMany({
          where: { userId: user.userId, challengeId: challenge.id },
          orderBy: { attemptNumber: "desc" },
          select: {
            id: true,
            status: true,
            evaluationScore: true,
            feedbackSummary: true,
            rubricBreakdown: true,
            attemptNumber: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      : [];

    return NextResponse.json({
      success: true,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        problemBrief: challenge.problemBrief,
        starterCodeOrDatasetUrl: challenge.starterCodeOrDatasetUrl,
        expectedDeliverableFormat: challenge.expectedDeliverableFormat,
        passingScore: challenge.passingScore,
        rubricCriteria: normalizeRubricCriteria(challenge.rubricCriteria),
        module: {
          id: challenge.learningModule.id,
          slug: challenge.learningModule.slug,
          title: challenge.learningModule.title,
          summary: challenge.learningModule.summary,
          contentMarkdown: challenge.learningModule.contentMarkdown,
          estimatedMinutes: challenge.learningModule.estimatedMinutes,
          skill: challenge.learningModule.skill,
        },
        mySubmissions: submissions,
      },
    });
  } catch (error) {
    console.error("GET /api/challenges/[id] error:", error);
    return apiError(500, "Failed to retrieve challenge.");
  }
}