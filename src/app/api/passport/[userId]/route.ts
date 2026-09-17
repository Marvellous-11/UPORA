import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";
import { decimalToNumber } from "@/lib/wallet/ledger";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

/** Public Skill Passport — exposes only verified, presentation-ready data. */
export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await context.params;
  const viewer = await getCurrentUser();

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { role: true, isEmailVerified: true } },
        skills: {
          include: {
            skill: true,
            evidenceSubmission: {
              select: {
                evaluationScore: true,
                feedbackSummary: true,
                rubricBreakdown: true,
                status: true,
                challenge: { select: { title: true } },
              },
            },
          },
          orderBy: { tier: "asc" },
        },
        portfolioItems: {
          where: { verifiedBadge: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) return apiError(404, "Passport not found.");
    if (!profile.isPassportPublic && viewer?.userId !== userId) {
      return apiError(404, "Passport not found.");
    }

    const reviews = await prisma.review.findMany({
      where: { targetUserId: userId },
      select: { ratingScore: true, feedbackPublic: true, createdAt: true, author: { select: { profile: { select: { fullName: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.ratingScore, 0) / reviews.length
        : null;

    return NextResponse.json({
      success: true,
      passport: {
        userId,
        fullName: profile.fullName,
        headline: profile.headline,
        bio: profile.bio,
        countryCode: profile.countryCode,
        timezone: profile.timezone,
        role: profile.user.role,
        isEmailVerified: profile.user.isEmailVerified,
        reputationScore: decimalToNumber(profile.reputationScore, 100),
        verifiedSkillsCount: profile.verifiedSkillsCount,
        completedProjectsCount: profile.completedProjectsCount,
        averageClientRating: avgRating,
        reviewCount: reviews.length,
        verifiedSkills: profile.skills
          .filter((s) => s.tier !== "SELF_REPORTED")
          .map((s) => ({
            name: s.skill.name,
            slug: s.skill.slug,
            category: s.skill.category,
            tier: s.tier,
            confidenceScore: decimalToNumber(s.confidenceScore),
            verifiedAt: s.verifiedAt,
            evidence: s.evidenceSubmission
              ? {
                  score: s.evidenceSubmission.evaluationScore,
                  verdict: s.evidenceSubmission.status,
                  feedback: s.evidenceSubmission.feedbackSummary,
                  challengeTitle: s.evidenceSubmission.challenge.title,
                }
              : null,
          })),
        portfolio: profile.portfolioItems.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          liveDemoUrl: p.liveDemoUrl,
          repositoryUrl: p.repositoryUrl,
          verifiedBadge: p.verifiedBadge,
        })),
        reviews: reviews.map((r) => ({
          ratingScore: r.ratingScore,
          feedbackPublic: r.feedbackPublic,
          authorName: r.author.profile?.fullName || "UPORA Client",
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/passport/[userId] error:", error);
    return apiError(500, "Failed to load passport.");
  }
}