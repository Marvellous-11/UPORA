/**
 * UPORA Skill Gap Analysis Engine
 * Compares user self-reported/verified skills against target career prerequisites.
 * Categorizes demonstrated strengths vs. prioritized gaps.
 */

import { CareerPathDefinition, CareerSkillReq } from "./recommendation";

export interface UserSkillItem {
  slug: string;
  name?: string;
  tier?: "SELF_REPORTED" | "ASSESSED" | "PROJECT_VERIFIED" | "CLIENT_VALIDATED";
  confidenceScore?: number;
}

export interface SkillGapItem {
  skill: CareerSkillReq;
  priorityOrder: number;
  reason: string;
  isBlocker: boolean;
}

export interface SkillGapAnalysis {
  careerSlug: string;
  careerTitle: string;
  demonstratedSkills: {
    slug: string;
    name: string;
    tier: string;
  }[];
  prioritizedGaps: SkillGapItem[];
  coveragePercentage: number;
  estimatedWeeksToClose: number;
  summary: string;
}

/**
 * Analyzes the gap between a user's skills and a target career path.
 */
export function analyzeSkillGap(
  userSkills: (string | UserSkillItem)[],
  careerPath: CareerPathDefinition,
  hoursPerWeek: number = 20
): SkillGapAnalysis {
  // Normalize user skills
  const normalizedUserSkills = new Map<string, { tier: string; name?: string }>();

  for (const s of userSkills) {
    if (typeof s === "string") {
      normalizedUserSkills.set(s.toLowerCase(), { tier: "SELF_REPORTED" });
    } else {
      normalizedUserSkills.set(s.slug.toLowerCase(), {
        tier: s.tier || "SELF_REPORTED",
        name: s.name,
      });
    }
  }

  const demonstrated: SkillGapAnalysis["demonstratedSkills"] = [];
  const missing: CareerSkillReq[] = [];

  for (const req of careerPath.requiredSkills) {
    const existing = normalizedUserSkills.get(req.slug.toLowerCase());
    if (existing) {
      demonstrated.push({
        slug: req.slug,
        name: req.name,
        tier: existing.tier,
      });
    } else {
      missing.push(req);
    }
  }

  // Sort missing skills: mandatory first, then by importance descending
  missing.sort((a, b) => {
    if (a.isMandatory !== b.isMandatory) {
      return a.isMandatory ? -1 : 1;
    }
    return b.importance - a.importance;
  });

  const prioritizedGaps: SkillGapItem[] = missing.map((req, index) => {
    const isBlocker = req.isMandatory && req.importance >= 8;
    const reason = isBlocker
      ? `Mandatory foundational prerequisite for ${careerPath.title}. Essential for passing initial technical evaluations.`
      : `High-value differentiator that increases contract and hiring competitiveness.`;

    return {
      skill: req,
      priorityOrder: index + 1,
      reason,
      isBlocker,
    };
  });

  const totalRequired = careerPath.requiredSkills.length;
  const coveragePercentage = totalRequired > 0
    ? Math.round((demonstrated.length / totalRequired) * 100)
    : 100;

  // Estimate weeks: ~15-20 study/practice hours per skill module
  const studyHoursPerSkill = 15;
  const totalHoursNeeded = missing.length * studyHoursPerSkill;
  const effectiveHoursPerWeek = Math.max(5, hoursPerWeek);
  const estimatedWeeksToClose = Math.max(1, Math.ceil(totalHoursNeeded / effectiveHoursPerWeek));

  let summary = "";
  if (missing.length === 0) {
    summary = `You meet 100% of the core skill prerequisites for ${careerPath.title}. You are ready for practical challenge verification and live opportunity matching.`;
  } else if (demonstrated.length > 0) {
    summary = `You have ${demonstrated.length} of ${totalRequired} core skills (${coveragePercentage}% coverage). Closing ${missing.length} prioritized gap(s) will take an estimated ${estimatedWeeksToClose} week(s) at ${effectiveHoursPerWeek} hrs/week.`;
  } else {
    summary = `You are starting fresh for ${careerPath.title}. Completing the ${missing.length} sequential practical modules will take an estimated ${estimatedWeeksToClose} week(s) at ${effectiveHoursPerWeek} hrs/week.`;
  }

  return {
    careerSlug: careerPath.slug,
    careerTitle: careerPath.title,
    demonstratedSkills: demonstrated,
    prioritizedGaps,
    coveragePercentage,
    estimatedWeeksToClose,
    summary,
  };
}
