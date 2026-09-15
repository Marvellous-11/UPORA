import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  headline: z.string().max(150).optional(),
  bio: z.string().max(500).optional(),
  countryCode: z.string().min(2).max(2).optional(),
  timezone: z.string().optional(),
  availabilityHoursPerWeek: z.number().int().min(1).max(80).optional(),
  targetAnnualIncome: z.number().min(0).optional(),
  isPassportPublic: z.boolean().optional(),
  primaryGoal: z.string().optional(),
  targetRole: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        userId: profile.userId,
        email: profile.user.email,
        role: profile.user.role,
        fullName: profile.fullName,
        headline: profile.headline,
        bio: profile.bio,
        countryCode: profile.countryCode,
        timezone: profile.timezone,
        preferredCurrency: profile.preferredCurrency,
        availabilityHoursPerWeek: profile.availabilityHoursPerWeek,
        targetAnnualIncome: profile.targetAnnualIncome ? Number(profile.targetAnnualIncome) : null,
        isPassportPublic: profile.isPassportPublic,
        reputationScore: Number(profile.reputationScore),
        verifiedSkillsCount: profile.verifiedSkillsCount,
        completedProjectsCount: profile.completedProjectsCount,
        onboardingCompleted: profile.onboardingCompleted,
        onboardingStep: profile.onboardingStep,
        primaryGoal: profile.primaryGoal,
        goals: profile.goals,
        experienceLevel: profile.experienceLevel,
        interests: profile.interests,
        targetRole: profile.targetRole,
        skills: profile.skills.map((s) => ({
          id: s.id,
          slug: s.skill.slug,
          name: s.skill.name,
          category: s.skill.category,
          tier: s.tier,
          confidenceScore: Number(s.confidenceScore),
          verifiedAt: s.verifiedAt,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await prisma.profile.update({
      where: { userId: user.userId },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.headline !== undefined && { headline: data.headline }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.countryCode !== undefined && { countryCode: data.countryCode }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.availabilityHoursPerWeek !== undefined && {
          availabilityHoursPerWeek: data.availabilityHoursPerWeek,
        }),
        ...(data.targetAnnualIncome !== undefined && {
          targetAnnualIncome: data.targetAnnualIncome,
        }),
        ...(data.isPassportPublic !== undefined && {
          isPassportPublic: data.isPassportPublic,
        }),
        ...(data.primaryGoal !== undefined && { primaryGoal: data.primaryGoal }),
        ...(data.targetRole !== undefined && { targetRole: data.targetRole }),
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        fullName: updated.fullName,
        headline: updated.headline,
        bio: updated.bio,
        countryCode: updated.countryCode,
        availabilityHoursPerWeek: updated.availabilityHoursPerWeek,
        primaryGoal: updated.primaryGoal,
        targetRole: updated.targetRole,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
