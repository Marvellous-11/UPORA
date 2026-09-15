import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const stepSaveSchema = z.object({
  step: z.number().int().min(1).max(6),
  primaryGoal: z.string().optional(),
  goals: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  educationLevel: z.string().optional(),
  interests: z.array(z.string()).optional(),
  workPreference: z.string().optional(),
  learningPace: z.string().optional(),
  targetRole: z.string().optional(),
  availabilityHoursPerWeek: z.number().int().min(1).max(80).optional(),
  skillSlugs: z.array(z.string()).optional(),
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
      onboarding: {
        onboardingStep: profile.onboardingStep,
        onboardingCompleted: profile.onboardingCompleted,
        primaryGoal: profile.primaryGoal,
        goals: profile.goals,
        experienceLevel: profile.experienceLevel,
        educationLevel: profile.educationLevel,
        interests: profile.interests,
        workPreference: profile.workPreference,
        learningPace: profile.learningPace,
        targetRole: profile.targetRole,
        availabilityHoursPerWeek: profile.availabilityHoursPerWeek,
        skills: profile.skills.map((s) => ({
          slug: s.skill.slug,
          name: s.skill.name,
          category: s.skill.category,
          tier: s.tier,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve onboarding state" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = stepSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid step data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      step,
      primaryGoal,
      goals,
      experienceLevel,
      educationLevel,
      interests,
      workPreference,
      learningPace,
      targetRole,
      availabilityHoursPerWeek,
      skillSlugs,
    } = parsed.data;

    // Update Profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.userId },
      data: {
        onboardingStep: step,
        ...(primaryGoal !== undefined && { primaryGoal }),
        ...(goals !== undefined && { goals }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(educationLevel !== undefined && { educationLevel }),
        ...(interests !== undefined && { interests }),
        ...(workPreference !== undefined && { workPreference }),
        ...(learningPace !== undefined && { learningPace }),
        ...(targetRole !== undefined && { targetRole }),
        ...(availabilityHoursPerWeek !== undefined && { availabilityHoursPerWeek }),
      },
    });

    // If skillSlugs are provided in this step, link them with SELF_REPORTED tier
    if (skillSlugs && skillSlugs.length > 0) {
      const skillsInDb = await prisma.skill.findMany({
        where: { slug: { in: skillSlugs } },
      });

      for (const skill of skillsInDb) {
        await prisma.userSkill.upsert({
          where: {
            profileId_skillId: {
              profileId: updatedProfile.id,
              skillId: skill.id,
            },
          },
          update: {},
          create: {
            profileId: updatedProfile.id,
            skillId: skill.id,
            tier: "SELF_REPORTED",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      onboardingStep: updatedProfile.onboardingStep,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to persist onboarding step" },
      { status: 500 }
    );
  }
}
