import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import { computeMilestoneCompletion, findCurrentMilestone } from "@/lib/roadmap/progress";

interface RouteContext {
  params: Promise<{ id: string; milestoneId: string }>;
}

/**
 * Marks the CURRENT LEARN-type milestone complete after the user has studied
 * the linked module content. Only the current milestone can be completed, so
 * progress cannot be skipped ahead.
 */
export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in.");

  const { id, milestoneId } = await context.params;

  try {
    const roadmap = await prisma.userRoadmap.findFirst({
      where: { id, userId: user.userId },
      include: { milestones: true },
    });
    if (!roadmap) return apiError(404, "Roadmap not found.");

    const milestone = roadmap.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return apiError(404, "Milestone not found.");

    if (milestone.actionType !== "LEARN") {
      return apiError(
        409,
        "Only study milestones can be completed this way. Practical milestones are completed by submitting verified work."
      );
    }

    const current = findCurrentMilestone(roadmap.milestones);
    if (!current || current.id !== milestone.id) {
      return apiError(409, "Only the current milestone can be completed.");
    }

    const { updates, nextStepIndex } = computeMilestoneCompletion(
      roadmap.milestones,
      milestone.stepOrder
    );

    if (updates.length === 0) {
      return apiError(409, "Milestone could not be completed.");
    }

    await prisma.$transaction([
      ...updates.map((u) =>
        prisma.roadmapMilestone.updateMany({
          where: { roadmapId: roadmap.id, stepOrder: u.stepOrder },
          data: { status: u.status, isCompleted: u.isCompleted, completedAt: u.completedAt },
        })
      ),
      prisma.userRoadmap.update({
        where: { id: roadmap.id },
        data: {
          currentStepIndex: nextStepIndex ?? roadmap.totalStepsCount - 1,
          isCompleted: nextStepIndex === null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Study milestone completed. Progress recorded.",
    });
  } catch (error) {
    console.error("POST roadmap milestone complete error:", error);
    return apiError(500, "Failed to update milestone.");
  }
}