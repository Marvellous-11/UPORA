/**
 * UPORA Roadmap Progress Engine
 * Pure milestone-transition logic (unit-testable) plus a Prisma-backed helper
 * that advances a user's active roadmap when real verification happens.
 */

export interface MilestoneState {
  id?: string;
  stepOrder: number;
  actionType: string;
  status: string;
  isCompleted: boolean;
}

export interface MilestoneUpdate {
  stepOrder: number;
  status: string;
  isCompleted: boolean;
  completedAt: Date | null;
}

/**
 * Computes the state updates required to complete a milestone and unlock the
 * next one. Returns an empty array when the milestone cannot be completed
 * (not current, already completed, or not found).
 */
export function computeMilestoneCompletion(
  milestones: MilestoneState[],
  stepToComplete: number
): { updates: MilestoneUpdate[]; nextStepIndex: number | null } {
  const ordered = [...milestones].sort((a, b) => a.stepOrder - b.stepOrder);
  const index = ordered.findIndex((m) => m.stepOrder === stepToComplete);

  if (index === -1) return { updates: [], nextStepIndex: null };

  const target = ordered[index];
  if (target.isCompleted) return { updates: [], nextStepIndex: null };

  // Only the first non-completed milestone (the "current" one) can be completed.
  const priorIncomplete = ordered.slice(0, index).find((m) => !m.isCompleted);
  if (priorIncomplete) return { updates: [], nextStepIndex: null };

  const updates: MilestoneUpdate[] = [
    {
      stepOrder: target.stepOrder,
      status: "COMPLETED",
      isCompleted: true,
      completedAt: new Date(),
    },
  ];

  const next = ordered[index + 1];
  let nextStepIndex: number | null = null;
  if (next) {
    updates.push({
      stepOrder: next.stepOrder,
      status: "IN_PROGRESS",
      isCompleted: false,
      completedAt: null,
    });
    nextStepIndex = index + 1;
  }

  return { updates, nextStepIndex };
}

/**
 * Returns the first milestone a user should act on, or null when the
 * roadmap is fully complete.
 */
export function findCurrentMilestone(milestones: MilestoneState[]): MilestoneState | null {
  const ordered = [...milestones].sort((a, b) => a.stepOrder - b.stepOrder);
  return ordered.find((m) => !m.isCompleted) ?? null;
}

import { prisma } from "@/lib/db/prisma";

/**
 * Advances the user's active roadmap when a practical/assessment milestone is
 * satisfied by a verified challenge submission. Learn milestones are advanced
 * through the explicit study-completion endpoint.
 */
export async function advanceRoadmapOnVerification(userId: string): Promise<void> {
  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId, isCompleted: false },
    include: { milestones: { orderBy: { stepOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  if (!roadmap || roadmap.milestones.length === 0) return;

  const current = findCurrentMilestone(roadmap.milestones);
  if (!current) return;

  // Only PRACTICE_PROJECT and ASSESSMENT milestones are driven by challenge
  // verification. LEARN and APPLY_TASK milestones are completed via their own
  // explicit actions.
  if (current.actionType !== "PRACTICE_PROJECT" && current.actionType !== "ASSESSMENT") {
    return;
  }

  const { updates, nextStepIndex } = computeMilestoneCompletion(
    roadmap.milestones,
    current.stepOrder
  );

  if (updates.length === 0) return;

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
}