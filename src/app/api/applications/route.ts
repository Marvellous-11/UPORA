import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

/** Returns the caller's applications (as talent) and, for clients, incoming applications on their tasks. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to view applications.");

  try {
    const [mine, incoming] = await Promise.all([
      prisma.taskApplication.findMany({
        where: { talentId: user.userId },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              tier: true,
              budgetAmount: true,
              currency: true,
              status: true,
              requiredSkills: true,
              client: { select: { profile: { select: { fullName: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.taskApplication.findMany({
        where: { task: { clientId: user.userId } },
        include: {
          task: { select: { id: true, title: true, tier: true, budgetAmount: true, currency: true } },
          talent: { select: { profile: { select: { fullName: true, headline: true, reputationScore: true, verifiedSkillsCount: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      mine: mine.map((a) => ({
        id: a.id,
        taskId: a.task.id,
        taskTitle: a.task.title,
        taskTier: a.task.tier,
        budgetAmount: Number(a.task.budgetAmount),
        currency: a.task.currency,
        taskStatus: a.task.status,
        requiredSkills: a.task.requiredSkills,
        clientName: a.task.client.profile?.fullName || "UPORA Client",
        proposalPitch: a.proposalPitch,
        proposedAmount: Number(a.proposedAmount),
        status: a.status,
        createdAt: a.createdAt,
      })),
      incoming: incoming.map((a) => ({
        id: a.id,
        taskId: a.task.id,
        taskTitle: a.task.title,
        taskTier: a.task.tier,
        budgetAmount: Number(a.task.budgetAmount),
        currency: a.task.currency,
        talentId: a.talentId,
        talentName: a.talent.profile?.fullName || "UPORA Talent",
        talentHeadline: a.talent.profile?.headline || null,
        talentReputation: a.talent.profile?.reputationScore
          ? Number(a.talent.profile.reputationScore)
          : 0,
        talentVerifiedSkills: a.talent.profile?.verifiedSkillsCount ?? 0,
        proposalPitch: a.proposalPitch,
        proposedAmount: Number(a.proposedAmount),
        status: a.status,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return apiError(500, "Failed to retrieve applications.");
  }
}