import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/** Removes a self-reported skill. Verified skills cannot be removed this way. */
export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in.");

  const { slug } = await context.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId },
      include: {
        skills: { where: { skill: { slug } }, include: { skill: true } },
      },
    });
    if (!profile) return apiError(404, "Profile not found.");

    const skillLink = profile.skills[0];
    if (!skillLink) return apiError(404, "Skill not found on your profile.");

    if (skillLink.tier !== "SELF_REPORTED") {
      return apiError(409, "Verified skills cannot be removed; they are linked to evidence.");
    }

    await prisma.userSkill.delete({ where: { id: skillLink.id } });
    return NextResponse.json({ success: true, message: "Skill removed from your profile." });
  } catch (error) {
    console.error("DELETE /api/profile/skills/[slug] error:", error);
    return apiError(500, "Failed to remove skill.");
  }
}