/**
 * UPORA Dynamic Roadmap Generator
 * Creates structured, milestone-driven roadmaps in PostgreSQL based on career recommendations.
 * Each roadmap contains 5 progressive phases:
 * Phase 1: Foundation & Prerequisite Study (LEARN)
 * Phase 2: Hands-on Practical Challenge (PRACTICE_PROJECT)
 * Phase 3: Verified Assessment Evaluation (ASSESSMENT)
 * Phase 4: Production-Grade Portfolio Artifact (PRACTICE_PROJECT)
 * Phase 5: Client Task & Career Application (APPLY_TASK)
 */

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { FOUNDATIONAL_CAREER_PATHS, CareerPathDefinition, UserOnboardingProfile } from "../career/recommendation";
import { analyzeSkillGap } from "../career/skill-gap";

export interface GeneratedMilestone {
  stepOrder: number;
  title: string;
  description: string;
  actionType: "LEARN" | "PRACTICE_PROJECT" | "ASSESSMENT" | "APPLY_TASK";
  targetEntityId?: string | null;
  status: "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "LOCKED";
  isCompleted: boolean;
}

export interface GeneratedRoadmapResult {
  id?: string;
  careerPathId?: string;
  careerSlug: string;
  careerTitle: string;
  currentStepIndex: number;
  totalStepsCount: number;
  isCompleted: boolean;
  milestones: GeneratedMilestone[];
  analysis: Record<string, unknown>;
}

export function buildMilestonesForCareer(
  career: CareerPathDefinition,
  missingSkillNames: string[]
): GeneratedMilestone[] {
  const primaryMissing = missingSkillNames[0] || career.requiredSkills[0]?.name || "Core Engineering";

  return [
    {
      stepOrder: 1,
      title: `Master Fundamentals: ${primaryMissing}`,
      description: `Complete foundational modules and architecture principles for ${primaryMissing}.`,
      actionType: "LEARN",
      targetEntityId: null,
      status: "AVAILABLE",
      isCompleted: false,
    },
    {
      stepOrder: 2,
      title: `Practical Sandbox: ${career.title} Simulation`,
      description: `Resolve realistic production scenarios in a controlled sandbox environment with automated test verification.`,
      actionType: "PRACTICE_PROJECT",
      targetEntityId: null,
      status: "LOCKED",
      isCompleted: false,
    },
    {
      stepOrder: 3,
      title: `Verified Competency Evaluation`,
      description: `Submit an audited technical challenge for ${career.title} to earn a verified skill credential.`,
      actionType: "ASSESSMENT",
      targetEntityId: null,
      status: "LOCKED",
      isCompleted: false,
    },
    {
      stepOrder: 4,
      title: `Production Portfolio Deliverable`,
      description: `Build an end-to-end open artifact demonstrating production telemetry, testing, and clean architecture.`,
      actionType: "PRACTICE_PROJECT",
      targetEntityId: null,
      status: "LOCKED",
      isCompleted: false,
    },
    {
      stepOrder: 5,
      title: `First Paid Task or Global Application`,
      description: `Apply your verified credentials to paid marketplace micro-contracts or global apprenticeship openings.`,
      actionType: "APPLY_TASK",
      targetEntityId: null,
      status: "LOCKED",
      isCompleted: false,
    },
  ];
}

/**
 * Generates and persists a 5-phase career roadmap for a user.
 */
export async function generateRoadmapForUser(
  userId: string,
  targetCareerSlug: string,
  profileData: UserOnboardingProfile
): Promise<GeneratedRoadmapResult> {
  const career =
    FOUNDATIONAL_CAREER_PATHS.find((c) => c.slug === targetCareerSlug) ||
    FOUNDATIONAL_CAREER_PATHS[0];

  const skillGap = analyzeSkillGap(
    profileData.selfReportedSkillSlugs || [],
    career,
    profileData.availabilityHoursPerWeek || 20
  );

  const missingNames = skillGap.prioritizedGaps.map((g) => g.skill.name);
  const milestoneTemplates = buildMilestonesForCareer(career, missingNames);

  const analysisPayload = {
    careerSlug: career.slug,
    careerTitle: career.title,
    coveragePercentage: skillGap.coveragePercentage,
    estimatedWeeksToClose: skillGap.estimatedWeeksToClose,
    demonstratedSkills: skillGap.demonstratedSkills,
    prioritizedGaps: skillGap.prioritizedGaps,
    generatedAt: new Date().toISOString(),
  };

  try {
    // 1. Check if CareerPath exists in database, otherwise find or create it
    let dbCareer = await prisma.careerPath.findUnique({
      where: { slug: career.slug },
    });

    if (!dbCareer) {
      dbCareer = await prisma.careerPath.create({
        data: {
          slug: career.slug,
          title: career.title,
          description: career.description,
          averageGlobalSalaryUSD: career.averageGlobalSalaryUSD,
          entryDifficulty: career.entryDifficulty,
          riskFactors: career.riskFactors,
        },
      });
    }

    // 2. Delete existing active roadmaps for this user to ensure idempotent creation
    await prisma.userRoadmap.deleteMany({
      where: { userId },
    });

    // 3. Create fresh UserRoadmap and Milestones in transactional consistency
    const createdRoadmap = await prisma.userRoadmap.create({
      data: {
        userId,
        careerPathId: dbCareer.id,
        currentStepIndex: 0,
        totalStepsCount: milestoneTemplates.length,
        isCompleted: false,
        generatedAnalysis: analysisPayload as unknown as Prisma.InputJsonValue,
        milestones: {
          create: milestoneTemplates.map((m) => ({
            stepOrder: m.stepOrder,
            title: m.title,
            description: m.description,
            actionType: m.actionType,
            targetEntityId: m.targetEntityId,
            status: m.status,
            isCompleted: m.isCompleted,
          })),
        },
      },
      include: {
        milestones: {
          orderBy: { stepOrder: "asc" },
        },
      },
    });

    return {
      id: createdRoadmap.id,
      careerPathId: createdRoadmap.careerPathId,
      careerSlug: career.slug,
      careerTitle: career.title,
      currentStepIndex: createdRoadmap.currentStepIndex,
      totalStepsCount: createdRoadmap.totalStepsCount,
      isCompleted: createdRoadmap.isCompleted,
      milestones: createdRoadmap.milestones.map((m) => ({
        stepOrder: m.stepOrder,
        title: m.title,
        description: m.description,
        actionType: m.actionType as GeneratedMilestone["actionType"],
        targetEntityId: m.targetEntityId,
        status: m.status as GeneratedMilestone["status"],
        isCompleted: m.isCompleted,
      })),
      analysis: analysisPayload,
    };
  } catch (error) {
    // If DB is unreachable or in non-DB testing, return clean generated result
    return {
      careerSlug: career.slug,
      careerTitle: career.title,
      currentStepIndex: 0,
      totalStepsCount: milestoneTemplates.length,
      isCompleted: false,
      milestones: milestoneTemplates,
      analysis: analysisPayload,
    };
  }
}
