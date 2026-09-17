import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

const createReviewSchema = z.object({
  contractId: z.string().min(1),
  targetUserId: z.string().min(1),
  ratingScore: z.number().int().min(1).max(5),
  feedbackPublic: z.string().min(10).max(1500),
  feedbackPrivate: z.string().max(2000).optional(),
});

/** Creates a review after a completed contract. One review per author per contract. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in to leave a review.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) return apiError(400, parsed.error.errors[0]?.message || "Invalid review.");

  try {
    const contract = await prisma.contract.findUnique({ where: { id: parsed.data.contractId } });
    if (!contract) return apiError(404, "Contract not found.");

    const isClient = contract.clientId === user.userId;
    const isTalent = contract.talentId === user.userId;
    if (!isClient && !isTalent) return apiError(403, "You were not a party to this contract.");
    if (contract.status !== "COMPLETED") {
      return apiError(409, "Reviews can only be written after a contract is completed.");
    }

    const expectedTarget = isClient ? contract.talentId : contract.clientId;
    if (parsed.data.targetUserId !== expectedTarget) {
      return apiError(400, "The review target must be your contract counterpart.");
    }

    const existing = await prisma.review.findUnique({
      where: {
        contractId_authorId: { contractId: contract.id, authorId: user.userId },
      },
    });
    if (existing) return apiError(409, "You have already reviewed this contract.");

    const review = await prisma.review.create({
      data: {
        contractId: contract.id,
        authorId: user.userId,
        targetUserId: parsed.data.targetUserId,
        ratingScore: parsed.data.ratingScore,
        feedbackPublic: parsed.data.feedbackPublic,
        feedbackPrivate: parsed.data.feedbackPrivate || null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Review submitted.", review: { id: review.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return apiError(500, "Failed to submit review.");
  }
}

/** Public review feed for a user (used by the passport). */
export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) return apiError(400, "userId query parameter is required.");

  try {
    const reviews = await prisma.review.findMany({
      where: { targetUserId: userId },
      select: {
        id: true,
        ratingScore: true,
        feedbackPublic: true,
        createdAt: true,
        contract: { select: { id: true, task: { select: { title: true } } } },
        author: { select: { profile: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        ratingScore: r.ratingScore,
        feedbackPublic: r.feedbackPublic,
        taskTitle: r.contract.task.title,
        authorName: r.author.profile?.fullName || "UPORA Client",
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return apiError(500, "Failed to retrieve reviews.");
  }
}