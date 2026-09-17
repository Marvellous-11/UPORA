import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import { normalizeRubricCriteria } from "@/lib/challenges/evaluator";

const querySchema = z.object({
  skillSlug: z.string().optional(),
});

/**
 * Lists active learning modules and their practical challenges.
 * When authenticated, includes the caller's submission status and the
 * caller's verification tier for the module's skill.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) return apiError(400, "Invalid query parameters.");

  try {
    const where = parsed.data.skillSlug ? { skill: { slug: parsed.data.skillSlug } } : {};

    const modules = await prisma.learningModule.findMany({
      where,
      include: {
        skill: { select: { slug: true, name: true, category: true } },
        challenges: {
          select: {
            id: true,
            title: true,
            problemBrief: true,
            expectedDeliverableFormat: true,
            rubricCriteria: true,
            passingScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    let verifiedSkillSlugs = new Set<string>();
    let submissionStates: Record<string, { status: string; evaluationScore: number | null; updatedAt: Date }> = {};

    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.userId },
        include: {
          skills: { include: { skill: true }, where: { tier: { in: ["ASSESSED", "PROJECT_VERIFIED", "CLIENT_VALIDATED"] } } },
        },
      });
      verifiedSkillSlugs = new Set(profile?.skills.map((s) => s.skill.slug) ?? []);

      const submissions = await prisma.projectSubmission.findMany({
        where: { userId: user.userId },
        select: { challengeId: true, status: true, evaluationScore: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      });
      for (const s of submissions) {
        if (!submissionStates[s.challengeId]) submissionStates[s.challengeId] = s;
      }
    }

    return NextResponse.json({
      success: true,
      modules: modules.map((m) => ({
        id: m.id,
        slug: m.slug,
        title: m.title,
        summary: m.summary,
        contentMarkdown: m.contentMarkdown,
        estimatedMinutes: m.estimatedMinutes,
        prerequisites: m.prerequisites,
        skill: m.skill,
        skillVerified: user ? verifiedSkillSlugs.has(m.skill.slug) : false,
        challenges: m.challenges.map((c) => ({
          id: c.id,
          title: c.title,
          problemBrief: c.problemBrief,
          expectedDeliverableFormat: c.expectedDeliverableFormat,
          criterionCount: normalizeRubricCriteria(c.rubricCriteria).length,
          passingScore: c.passingScore,
          mySubmission: user ? (submissionStates[c.id] ?? null) : null,
        })),
      })),
    });
  } catch (error) {
    console.error("GET /api/challenges error:", error);
    return apiError(500, "Failed to retrieve learning challenges.");
  }
}