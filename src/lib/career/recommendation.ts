/**
 * UPORA Career Recommendation Engine
 * Deterministic, transparent, and explainable career matching.
 * Formula: Score = (w_interest * S_interest) + (w_skill * S_overlap) + (w_goal * S_goal) + (w_exp * S_exp)
 */

export interface UserOnboardingProfile {
  primaryGoal?: string | null;
  goals?: string[];
  experienceLevel?: string | null;
  educationLevel?: string | null;
  interests?: string[];
  selfReportedSkillSlugs?: string[];
  availabilityHoursPerWeek?: number;
  targetRole?: string | null;
}

export interface CareerSkillReq {
  slug: string;
  name: string;
  importance: number; // 1 to 10
  isMandatory: boolean;
}

export interface CareerPathDefinition {
  id?: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  averageGlobalSalaryUSD: number;
  entryDifficulty: "EASY" | "MODERATE" | "STEEP";
  riskFactors: string[];
  matchedInterests: string[];
  requiredSkills: CareerSkillReq[];
}

export interface CareerMatchResult {
  careerPath: CareerPathDefinition;
  matchScore: number; // 0 to 100
  rationale: string;
  skillOverlapCount: number;
  missingMandatoryCount: number;
  readinessLevel: "READY_FOR_WORK" | "NEEDS_CORE_SKILLS" | "BEGINNER_RAMP_UP";
}

export const FOUNDATIONAL_CAREER_PATHS: CareerPathDefinition[] = [
  {
    slug: "cloud-security",
    title: "Cloud Infrastructure & Systems Security Associate",
    category: "Cybersecurity & Systems",
    description: "Specialize in cloud server reliability, automated monitoring, perimeter defense, and rapid incident response.",
    averageGlobalSalaryUSD: 65000,
    entryDifficulty: "MODERATE",
    riskFactors: [
      "Increasing AI automation of basic server provisioning means engineers must focus on complex security compliance and incident resolution.",
    ],
    matchedInterests: [
      "cybersecurity",
      "cloud computing",
      "systems",
      "security",
      "infrastructure",
      "linux",
      "devops",
    ],
    requiredSkills: [
      { slug: "linux-systems-admin", name: "Linux Systems Administration", importance: 9, isMandatory: true },
      { slug: "incident-triage-soc", name: "Incident Triage & SOC Reporting", importance: 8, isMandatory: true },
    ],
  },
  {
    slug: "software-engineering",
    title: "Full-Stack Software Engineer",
    category: "Software Development",
    description: "Build robust end-to-end web applications, resilient backend services, and scalable cloud database architectures.",
    averageGlobalSalaryUSD: 72000,
    entryDifficulty: "MODERATE",
    riskFactors: [
      "Generic syntax generation is increasingly automated; engineers must excel in system architecture, type safety, and product logic.",
    ],
    matchedInterests: [
      "software engineering",
      "web development",
      "full stack",
      "coding",
      "frontend",
      "backend",
      "typescript",
      "react",
    ],
    requiredSkills: [
      { slug: "typescript-fullstack", name: "TypeScript & API Engineering", importance: 9, isMandatory: true },
      { slug: "react-frontend-ui", name: "Modern React & UI Architecture", importance: 8, isMandatory: true },
      { slug: "sql-data-modeling", name: "SQL Data Modeling & Querying", importance: 7, isMandatory: true },
    ],
  },
  {
    slug: "cloud-devops",
    title: "Cloud DevOps & Platform Engineer",
    category: "Cloud & DevOps",
    description: "Design automated continuous delivery pipelines, container orchestrations, and robust infrastructure as code.",
    averageGlobalSalaryUSD: 78000,
    entryDifficulty: "STEEP",
    riskFactors: [
      "Cloud vendor pricing complexity requires platform engineers to possess deep FinOps cost optimization and monitoring expertise.",
    ],
    matchedInterests: [
      "cloud computing",
      "devops",
      "containers",
      "docker",
      "infrastructure",
      "kubernetes",
      "automation",
    ],
    requiredSkills: [
      { slug: "linux-systems-admin", name: "Linux Systems Administration", importance: 9, isMandatory: true },
      { slug: "docker-containerization", name: "Docker & Container Workflows", importance: 8, isMandatory: true },
    ],
  },
  {
    slug: "data-analytics",
    title: "Data Analyst & Business Intelligence Specialist",
    category: "Data Operations",
    description: "Turn raw transactional datasets into clear executive dashboards, actionable funnel metrics, and predictive insights.",
    averageGlobalSalaryUSD: 58000,
    entryDifficulty: "EASY",
    riskFactors: [
      "Basic queries can be generated with natural language; competitive analysts must master domain translation and data verification.",
    ],
    matchedInterests: [
      "data analytics",
      "data science",
      "business intelligence",
      "sql",
      "python",
      "analytics",
      "dashboards",
    ],
    requiredSkills: [
      { slug: "sql-data-modeling", name: "SQL Data Modeling & Querying", importance: 9, isMandatory: true },
      { slug: "python-data-analytics", name: "Python Data Analysis & Pandas", importance: 8, isMandatory: true },
    ],
  },
  {
    slug: "digital-growth",
    title: "Technical Growth & Performance Marketer",
    category: "Growth & Marketing",
    description: "Drive verifiable user acquisition, search rankings, retention experiments, and automated marketing workflows.",
    averageGlobalSalaryUSD: 52000,
    entryDifficulty: "EASY",
    riskFactors: [
      "Ad platform automation requires growth operators to emphasize first-party data capture, high-converting copy, and real attribution.",
    ],
    matchedInterests: [
      "digital marketing",
      "growth",
      "seo",
      "analytics",
      "marketing",
      "product growth",
      "content",
    ],
    requiredSkills: [
      { slug: "digital-growth-analytics", name: "Conversion Analytics & SEO Growth", importance: 9, isMandatory: true },
      { slug: "sql-data-modeling", name: "SQL Data Modeling & Querying", importance: 6, isMandatory: false },
    ],
  },
];

/**
 * Calculates match scores and rank orders career paths deterministically.
 */
export function calculateCareerMatches(
  userProfile: UserOnboardingProfile,
  careerCatalog: CareerPathDefinition[] = FOUNDATIONAL_CAREER_PATHS
): CareerMatchResult[] {
  const normalizedInterests = (userProfile.interests || []).map((i) => i.trim().toLowerCase());
  const userSkillsSet = new Set((userProfile.selfReportedSkillSlugs || []).map((s) => s.trim().toLowerCase()));
  const expLevel = (userProfile.experienceLevel || "BEGINNER").toUpperCase();

  const results: CareerMatchResult[] = careerCatalog.map((path) => {
    // 1. Interest Score (Weight: 40%)
    let interestMatches = 0;
    if (normalizedInterests.length > 0) {
      for (const interest of normalizedInterests) {
        if (
          path.matchedInterests.some(
            (mi) => mi.includes(interest) || interest.includes(mi) || path.category.toLowerCase().includes(interest)
          )
        ) {
          interestMatches++;
        }
      }
    }
    const interestScore = normalizedInterests.length > 0
      ? Math.min(100, Math.round((interestMatches / Math.max(1, Math.min(3, normalizedInterests.length))) * 100))
      : 30; // Baseline neutral interest if none selected

    // 2. Skill Overlap Score (Weight: 35%)
    const totalRequiredSkills = path.requiredSkills.length;
    let matchingSkillsCount = 0;
    let missingMandatoryCount = 0;

    for (const req of path.requiredSkills) {
      const hasSkill = userSkillsSet.has(req.slug.toLowerCase());
      if (hasSkill) {
        matchingSkillsCount++;
      } else if (req.isMandatory) {
        missingMandatoryCount++;
      }
    }

    const skillScore = totalRequiredSkills > 0
      ? Math.round((matchingSkillsCount / totalRequiredSkills) * 100)
      : 0;

    // 3. Goal Alignment (Weight: 15%)
    let goalScore = 60; // neutral default
    const primaryGoal = (userProfile.primaryGoal || "").toLowerCase();
    if (primaryGoal.includes("earn") || primaryGoal.includes("freelance") || primaryGoal.includes("project")) {
      if (path.entryDifficulty === "EASY") goalScore = 95;
      else if (path.entryDifficulty === "MODERATE") goalScore = 80;
      else goalScore = 60;
    } else if (primaryGoal.includes("career") || primaryGoal.includes("job")) {
      if (path.entryDifficulty === "MODERATE" || path.entryDifficulty === "STEEP") goalScore = 90;
      else goalScore = 80;
    } else if (primaryGoal.includes("skills") || primaryGoal.includes("learn")) {
      goalScore = 85;
    }

    // 4. Experience Fit Score (Weight: 10%)
    let expScore = 70;
    if (expLevel.includes("BEGINNER") || expLevel.includes("NO_EXPERIENCE")) {
      if (path.entryDifficulty === "EASY") expScore = 100;
      else if (path.entryDifficulty === "MODERATE") expScore = 75;
      else expScore = 50;
    } else if (expLevel.includes("INTERMEDIATE")) {
      if (path.entryDifficulty === "MODERATE") expScore = 100;
      else if (path.entryDifficulty === "EASY") expScore = 85;
      else expScore = 80;
    } else if (expLevel.includes("ADVANCED") || expLevel.includes("PROFESSIONAL")) {
      if (path.entryDifficulty === "STEEP") expScore = 100;
      else expScore = 80;
    }

    // Weighted composite score
    const compositeScore = Math.min(
      99,
      Math.max(
        15,
        Math.round(
          interestScore * 0.4 +
          skillScore * 0.35 +
          goalScore * 0.15 +
          expScore * 0.1
        )
      )
    );

    // Human-readable transparent rationale
    let rationale = "";
    if (interestMatches > 0 && matchingSkillsCount > 0) {
      rationale = `Strong alignment with your interest in ${path.category} and verified overlap with your ${matchingSkillsCount} existing skill(s).`;
    } else if (interestMatches > 0) {
      rationale = `Matches your selected interests in ${path.category}. Completing practical challenges will build your core prerequisites.`;
    } else if (matchingSkillsCount > 0) {
      rationale = `Your existing skills provide a fast-track foundation for this role, shortening your time-to-work.`;
    } else {
      rationale = `High-demand global opportunity path with clear, step-by-step practical milestones.`;
    }

    // Readiness Level
    let readinessLevel: CareerMatchResult["readinessLevel"] = "BEGINNER_RAMP_UP";
    if (missingMandatoryCount === 0 && matchingSkillsCount > 0) {
      readinessLevel = "READY_FOR_WORK";
    } else if (matchingSkillsCount > 0) {
      readinessLevel = "NEEDS_CORE_SKILLS";
    }

    return {
      careerPath: path,
      matchScore: compositeScore,
      rationale,
      skillOverlapCount: matchingSkillsCount,
      missingMandatoryCount,
      readinessLevel,
    };
  });

  // Sort descending by score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
