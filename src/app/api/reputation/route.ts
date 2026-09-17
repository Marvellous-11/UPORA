import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import { computeReputationScore, describeScoreBand } from "@/lib/reputation/scoring";

/**
 * Recomputes the caller's reputation from real platform activity and
 * persists it (with an audit log entry). The result is fully explainable.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to view reputation.");

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId },
      include: {
        skills: true,
      },
    });
    if (!profile) return apiError(404, "Profile not found.");

    const verifiedSkills = profile.skills.filter((s) => s.tier !== "SELF_REPORTED").length;

    const passedSubmissions = await prisma.projectSubmission.findMany({
      where: { userId: user.userId, status: "PASSED" },
      select: { challengeId: true },
      distinct: ["challengeId"],
    });
    const passedChallenges = passedSubmissions.length;

    const completedContracts = await prisma.contract.count({
      where: { talentId: user.userId, status: "COMPLETED" },
    });

    const reviews = await prisma.review.findMany({
      where: { targetUserId: user.userId },
      select: { ratingScore: true },
    });
    const averageClientRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.ratingScore, 0) / reviews.length
        : null;

    const paidMilestones = await prisma.contractMilestone.findMany({
      where: {
        contract: { talentId: user.userId },
        status: { in: ["APPROVED", "PAID_OUT"] },
      },
      select: { dueDate: true, updatedAt: true },
    });
    const onTimeDeliveries = paidMilestones.filter((m) => m.updatedAt <= m.dueDate).length;
    const revisionRate = 0; // revision flow not implemented — no penalty is manufactured

    const result = computeReputationScore({
      verifiedSkills,
      passedChallenges,
      completedContracts,
      averageClientRating,
      onTimeDeliveries,
      totalDeliveries: paidMilestones.length,
      revisionRate,
    });

    const previous = Number(profile.reputationScore);
    const scoreChange = Math.round((result.score - previous) * 100) / 100;

    if (scoreChange !== 0) {
      await prisma.$transaction([
        prisma.profile.update({
          where: { id: profile.id },
          data: { reputationScore: result.score },
        }),
        prisma.reputationLog.create({
          data: {
            userId: user.userId,
            scoreChange,
            newScore: result.score,
            reasonCode: "RECOMPUTE_FROM_ACTIVITY",
          },
        }),
      ]);
    }

    const logs = await prisma.reputationLog.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      reputation: {
        score: result.score,
        band: describeScoreBand(result.score),
        components: result.components,
        breakdown: result.breakdown,
        activity: {
          verifiedSkills,
          passedChallenges,
          completedContracts,
          averageClientRating,
          onTimeDeliveries,
          totalDeliveries: paidMilestones.length,
        },
        history: logs.map((l) => ({
          change: Number(l.scoreChange),
          newScore: Number(l.newScore),
          reasonCode: l.reasonCode,
          createdAt: l.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/reputation error:", error);
    return apiError(500, "Failed to compute reputation.");
  }
}