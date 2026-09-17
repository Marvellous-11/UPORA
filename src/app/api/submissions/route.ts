import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

/** Returns the authenticated user's challenge submissions. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to view submissions.");

  try {
    const submissions = await prisma.projectSubmission.findMany({
      where: { userId: user.userId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            learningModule: { select: { slug: true, title: true, skill: { select: { name: true, slug: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      submissions: submissions.map((s) => ({
        id: s.id,
        challengeTitle: s.challenge.title,
        moduleTitle: s.challenge.learningModule.title,
        moduleSlug: s.challenge.learningModule.slug,
        skillName: s.challenge.learningModule.skill.name,
        skillSlug: s.challenge.learningModule.skill.slug,
        status: s.status,
        evaluationScore: s.evaluationScore,
        passingScore: s.challenge.passingScore,
        feedbackSummary: s.feedbackSummary,
        evaluatorType: s.evaluatorType,
        attemptNumber: s.attemptNumber,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return apiError(500, "Failed to retrieve submissions.");
  }
}