import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/respond";

const addSkillSchema = z.object({
  skillSlug: z.string().min(2).max(120),
});

/** Adds a self-reported skill to the caller's profile (never auto-verified). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "You must be signed in.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid JSON body.");
  }

  const parsed = addSkillSchema.safeParse(body);
  if (!parsed.success) return apiError(400, "skillSlug is required.");

  try {
    const profile = await prisma.profile.findUnique({ where: { userId: user.userId } });
    if (!profile) return apiError(404, "Profile not found.");

    const skill = await prisma.skill.findUnique({ where: { slug: parsed.data.skillSlug } });
    if (!skill) return apiError(404, "Skill not found in the catalog.");

    const upserted = await prisma.userSkill.upsert({
      where: {
        profileId_skillId: { profileId: profile.id, skillId: skill.id },
      },
      update: {},
      create: {
        profileId: profile.id,
        skillId: skill.id,
        tier: "SELF_REPORTED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Skill added as SELF-REPORTED.",
        skill: { id: upserted.id, slug: skill.slug, name: skill.name, tier: upserted.tier },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/profile/skills error:", error);
    return apiError(500, "Failed to add skill.");
  }
}