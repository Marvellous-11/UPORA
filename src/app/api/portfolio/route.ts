import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

const createPortfolioSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(2000),
  liveDemoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  repositoryUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

/** Creates a self-reported portfolio entry (not auto-verified). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const parsed = createPortfolioSchema.safeParse(body);
  if (!parsed.success) return apiError(400, parsed.error.errors[0]?.message || "Invalid portfolio data.");

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: user.userId } });
    if (!profile) return apiError(404, "Profile not found.");

    const item = await prisma.portfolioItem.create({
      data: {
        profileId: profile.id,
        title: parsed.data.title,
        description: parsed.data.description,
        liveDemoUrl: parsed.data.liveDemoUrl || null,
        repositoryUrl: parsed.data.repositoryUrl || null,
        verifiedBadge: false,
      },
    });

    return NextResponse.json(
      { success: true, message: "Portfolio entry added.", item },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/portfolio error:", error);
    return apiError(500, "Failed to add portfolio entry.");
  }
}