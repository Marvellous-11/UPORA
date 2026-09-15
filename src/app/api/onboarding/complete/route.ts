import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateCareerMatches, UserOnboardingProfile } from "@/lib/career/recommendation";
import { generateRoadmapForUser } from "@/lib/roadmap/generator";

const completeSchema = z.object({
  primaryGoal: z.string().min(1, "Primary goal is required"),
  goals: z.array(z.string()).default([]),
  experienceLevel: z.string().min(1, "Experience level is required"),
  educationLevel: z.string().optional(),
  interests: z.array(z.string()).default([]),
  workPreference: z.string().optional(),
  learningPace: z.string().optional(),
  targetRole: z.string().optional(),
  availabilityHoursPerWeek: z.number().int().min(1).max(80).default(20),
  skillSlugs: z.array(z.string()).default([]),
  chosenCareerSlug: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = completeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid completion payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
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
      chosenCareerSlug,
    } = parsed.data;

    // 1. Update Profile to completed state
    const profile = await prisma.profile.update({
      where: { userId: user.userId },
      data: {
        onboardingCompleted: true,
        onboardingStep: 6,
        primaryGoal,
        goals,
        experienceLevel,
        educationLevel: educationLevel || null,
        interests,
        workPreference: workPreference || null,
        learningPace: learningPace || null,
        targetRole: targetRole || null,
        availabilityHoursPerWeek,
      },
    });

    // 2. Persist self-reported skills strictly as SELF_REPORTED
    if (skillSlugs.length > 0) {
      const skillsInDb = await prisma.skill.findMany({
        where: { slug: { in: skillSlugs } },
      });

      for (const skill of skillsInDb) {
        await prisma.userSkill.upsert({
          where: {
            profileId_skillId: {
              profileId: profile.id,
              skillId: skill.id,
            },
          },
          update: {},
          create: {
            profileId: profile.id,
            skillId: skill.id,
            tier: "SELF_REPORTED",
          },
        });
      }
    }

    // 3. Compute Deterministic Career Matches
    const profileInput: UserOnboardingProfile = {
      primaryGoal,
      goals,
      experienceLevel,
      educationLevel,
      interests,
      selfReportedSkillSlugs: skillSlugs,
      availabilityHoursPerWeek,
      targetRole,
    };

    const matches = calculateCareerMatches(profileInput);

    // 4. Determine Target Career Path
    const targetCareer = chosenCareerSlug || matches[0]?.careerPath.slug || "cloud-security";

    // 5. Generate and Persist Roadmap
    const roadmap = await generateRoadmapForUser(user.userId, targetCareer, profileInput);

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      targetCareer,
      matches,
      roadmap,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
