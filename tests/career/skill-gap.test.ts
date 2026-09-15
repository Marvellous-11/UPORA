import { describe, it, expect } from "vitest";
import { analyzeSkillGap } from "@/lib/career/skill-gap";
import { FOUNDATIONAL_CAREER_PATHS } from "@/lib/career/recommendation";

describe("Skill Gap Analysis Engine", () => {
  const securityCareer = FOUNDATIONAL_CAREER_PATHS.find((c) => c.slug === "cloud-security")!;

  it("should calculate 100% coverage when user has all required skills", () => {
    const analysis = analyzeSkillGap(
      ["linux-systems-admin", "incident-triage-soc"],
      securityCareer,
      20
    );

    expect(analysis.coveragePercentage).toBe(100);
    expect(analysis.demonstratedSkills.length).toBe(2);
    expect(analysis.prioritizedGaps.length).toBe(0);
    expect(analysis.summary).toContain("100%");
  });

  it("should correctly identify and prioritize missing mandatory skills", () => {
    const analysis = analyzeSkillGap(
      ["linux-systems-admin"],
      securityCareer,
      15
    );

    expect(analysis.coveragePercentage).toBe(50);
    expect(analysis.demonstratedSkills.length).toBe(1);
    expect(analysis.prioritizedGaps.length).toBe(1);
    expect(analysis.prioritizedGaps[0].skill.slug).toBe("incident-triage-soc");
    expect(analysis.prioritizedGaps[0].isBlocker).toBe(true);
  });

  it("should calculate realistic weeks to close gap based on weekly commitment", () => {
    // Missing 2 skills = ~30 hours needed
    // At 10 hours/week = ~3 weeks
    const analysis10Hrs = analyzeSkillGap([], securityCareer, 10);
    expect(analysis10Hrs.estimatedWeeksToClose).toBe(3);

    // At 30 hours/week = 1 week
    const analysis30Hrs = analyzeSkillGap([], securityCareer, 30);
    expect(analysis30Hrs.estimatedWeeksToClose).toBe(1);
  });
});
