import { describe, it, expect } from "vitest";
import {
  calculateCareerMatches,
  FOUNDATIONAL_CAREER_PATHS,
} from "@/lib/career/recommendation";

describe("Deterministic Career Recommendation Engine", () => {
  it("should rank Cybersecurity first when interest is security and skills include linux", () => {
    const results = calculateCareerMatches({
      interests: ["cybersecurity", "security"],
      selfReportedSkillSlugs: ["linux-systems-admin"],
      primaryGoal: "first_job",
      experienceLevel: "BEGINNER",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].careerPath.slug).toBe("cloud-security");
    expect(results[0].matchScore).toBeGreaterThanOrEqual(60);
    expect(results[0].rationale).toContain("Cybersecurity");
  });

  it("should rank Software Engineering first when interests include software and web development", () => {
    const results = calculateCareerMatches({
      interests: ["software engineering", "web development"],
      selfReportedSkillSlugs: ["typescript-fullstack", "react-frontend-ui"],
      primaryGoal: "build_portfolio",
      experienceLevel: "INTERMEDIATE",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].careerPath.slug).toBe("software-engineering");
    expect(results[0].skillOverlapCount).toBe(2);
    expect(results[0].matchScore).toBeGreaterThanOrEqual(75);
  });

  it("should produce deterministic, identical outputs for identical inputs", () => {
    const profile = {
      interests: ["data analytics"],
      selfReportedSkillSlugs: ["sql-data-modeling"],
      primaryGoal: "earn_while_learning",
      experienceLevel: "BEGINNER",
    };

    const runA = calculateCareerMatches(profile);
    const runB = calculateCareerMatches(profile);

    expect(runA.map((r) => r.careerPath.slug)).toEqual(runB.map((r) => r.careerPath.slug));
    expect(runA.map((r) => r.matchScore)).toEqual(runB.map((r) => r.matchScore));
  });

  it("should calculate readiness levels accurately based on skill overlap", () => {
    const readyProfile = calculateCareerMatches({
      interests: ["cloud computing"],
      selfReportedSkillSlugs: ["linux-systems-admin", "incident-triage-soc"],
      primaryGoal: "first_job",
      experienceLevel: "INTERMEDIATE",
    });

    const securityMatch = readyProfile.find((r) => r.careerPath.slug === "cloud-security");
    expect(securityMatch?.readinessLevel).toBe("READY_FOR_WORK");
    expect(securityMatch?.missingMandatoryCount).toBe(0);
  });
});
