import { describe, it, expect } from "vitest";
import {
  buildMilestonesForCareer,
  generateRoadmapForUser,
} from "@/lib/roadmap/generator";
import { FOUNDATIONAL_CAREER_PATHS } from "@/lib/career/recommendation";

describe("Roadmap Generation Engine", () => {
  const softwareCareer = FOUNDATIONAL_CAREER_PATHS.find((c) => c.slug === "software-engineering")!;

  it("should build 5 progressive milestone phases with correct action types", () => {
    const milestones = buildMilestonesForCareer(softwareCareer, ["TypeScript & API Engineering"]);

    expect(milestones).toHaveLength(5);
    expect(milestones[0].actionType).toBe("LEARN");
    expect(milestones[0].status).toBe("AVAILABLE");
    expect(milestones[1].actionType).toBe("PRACTICE_PROJECT");
    expect(milestones[2].actionType).toBe("ASSESSMENT");
    expect(milestones[3].actionType).toBe("PRACTICE_PROJECT");
    expect(milestones[4].actionType).toBe("APPLY_TASK");
  });

  it("should generate a complete structured roadmap result object", async () => {
    const result = await generateRoadmapForUser("mock-user-123", "software-engineering", {
      primaryGoal: "first_job",
      experienceLevel: "BEGINNER",
      availabilityHoursPerWeek: 20,
      selfReportedSkillSlugs: ["typescript-fullstack"],
    });

    expect(result).toBeDefined();
    expect(result.careerSlug).toBe("software-engineering");
    expect(result.milestones).toHaveLength(5);
    expect(result.analysis).toBeDefined();
  });
});
