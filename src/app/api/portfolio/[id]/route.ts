import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Deletes a portfolio entry owned by the caller. */
export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in.");

  const { id } = await context.params;

  try {
    const item = await prisma.portfolioItem.findUnique({ where: { id } });
    if (!item) return apiError(404, "Portfolio entry not found.");

    const profile = await prisma.profile.findUnique({ where: { userId: user.userId } });
    if (!profile || item.profileId !== profile.id) {
      return apiError(403, "You can only remove your own portfolio entries.");
    }

    if (item.verifiedBadge) {
      return apiError(
        409,
        "Verified evidence entries cannot be removed — they are linked to a graded submission."
      );
    }

    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Portfolio entry removed." });
  } catch (error) {
    console.error("DELETE /api/portfolio/[id] error:", error);
    return apiError(500, "Failed to remove portfolio entry.");
  }
}