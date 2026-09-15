/**
 * UPORA Next-Best-Action Engine
 * State-machine driven determination of the single highest-leverage action a user should take.
 */

import { prisma } from "@/lib/db/prisma";

export interface NextBestAction {
  actionType:
    | "SIGN_UP_OR_LOGIN"
    | "COMPLETE_ONBOARDING"
    | "SELECT_CAREER_PATH"
    | "COMPLETE_MILESTONE"
    | "APPLY_TO_WORK";
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  badgeText?: string;
  meta?: Record<string, unknown>;
}

/**
 * Calculates the next best action for a given user.
 */
export async function getNextBestAction(userId: string | null | undefined): Promise<NextBestAction> {
  // 1. Unauthenticated Visitor
  if (!userId) {
    return {
      actionType: "SIGN_UP_OR_LOGIN",
      title: "Activate Your Career Opportunity Journey",
      description: "Complete your diagnostic onboarding in 2 minutes to generate a structured skill roadmap and access verified work.",
      ctaLabel: "Get Started Free",
      ctaUrl: "/register",
      priority: "HIGH",
      badgeText: "Step 1 of Journey",
    };
  }

  try {
    // 2. Fetch User Profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        roadmaps: {
          include: {
            milestones: {
              orderBy: { stepOrder: "asc" },
            },
            careerPath: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return {
        actionType: "SIGN_UP_OR_LOGIN",
        title: "Session Expired",
        description: "Please sign in again to continue your progress.",
        ctaLabel: "Sign In",
        ctaUrl: "/login",
        priority: "HIGH",
      };
    }

    // 3. Check Onboarding Completion
    if (!user.profile?.onboardingCompleted) {
      const step = user.profile?.onboardingStep || 1;
      return {
        actionType: "COMPLETE_ONBOARDING",
        title: "Complete Career Diagnostics",
        description: `Resume step ${step} of 6 to establish your baseline skills and receive your custom learning & earnings roadmap.`,
        ctaLabel: "Resume Onboarding",
        ctaUrl: "/onboarding",
        priority: "HIGH",
        badgeText: `Step ${step}/6 In Progress`,
      };
    }

    // 4. Check Roadmaps
    const activeRoadmap = user.roadmaps[0];
    if (!activeRoadmap) {
      return {
        actionType: "SELECT_CAREER_PATH",
        title: "Select Your Target Career Path",
        description: "Your diagnostic profile is complete. Choose your target career trajectory to unlock practical learning challenges.",
        ctaLabel: "Explore Recommended Paths",
        ctaUrl: "/discover",
        priority: "HIGH",
        badgeText: "Action Required",
      };
    }

    // 5. Check Next Incomplete Milestone
    const nextMilestone = activeRoadmap.milestones.find((m) => !m.isCompleted);

    if (nextMilestone) {
      let ctaUrl = "/learning";
      let ctaLabel = "Start Learning";

      if (nextMilestone.actionType === "PRACTICE_PROJECT") {
        ctaUrl = "/challenges";
        ctaLabel = "Open Sandbox Challenge";
      } else if (nextMilestone.actionType === "ASSESSMENT") {
        ctaUrl = "/learning";
        ctaLabel = "Take Competency Assessment";
      } else if (nextMilestone.actionType === "APPLY_TASK") {
        ctaUrl = "/tasks";
        ctaLabel = "Browse Open Micro-Tasks";
      }

      return {
        actionType: "COMPLETE_MILESTONE",
        title: nextMilestone.title,
        description: nextMilestone.description,
        ctaLabel,
        ctaUrl,
        priority: "HIGH",
        badgeText: `Milestone ${nextMilestone.stepOrder} of ${activeRoadmap.milestones.length}`,
        meta: {
          roadmapId: activeRoadmap.id,
          milestoneId: nextMilestone.id,
          careerTitle: activeRoadmap.careerPath.title,
        },
      };
    }

    // 6. All Milestones Complete -> Apply for Work
    return {
      actionType: "APPLY_TO_WORK",
      title: "Ready for Paid Marketplace Tasks",
      description: `You have completed all milestones for ${activeRoadmap.careerPath.title}! Your verified credentials qualify you for live micro-contracts.`,
      ctaLabel: "Browse Matched Work",
      ctaUrl: "/tasks",
      priority: "HIGH",
      badgeText: "Verified Candidate",
    };
  } catch (error) {
    // Graceful fallback if database check encounters transient failure
    return {
      actionType: "COMPLETE_ONBOARDING",
      title: "Continue Your Opportunity Journey",
      description: "Explore practical learning modules and verify your skills.",
      ctaLabel: "Go to Onboarding",
      ctaUrl: "/onboarding",
      priority: "MEDIUM",
    };
  }
}
