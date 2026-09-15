import { describe, it, expect } from "vitest";
import { getNextBestAction } from "@/lib/roadmap/next-action";

describe("Next-Best-Action Engine", () => {
  it("should return SIGN_UP_OR_LOGIN when user is not authenticated", async () => {
    const action = await getNextBestAction(null);
    expect(action.actionType).toBe("SIGN_UP_OR_LOGIN");
    expect(action.ctaUrl).toBe("/register");
    expect(action.priority).toBe("HIGH");
  });

  it("should return SIGN_UP_OR_LOGIN when userId is undefined", async () => {
    const action = await getNextBestAction(undefined);
    expect(action.actionType).toBe("SIGN_UP_OR_LOGIN");
    expect(action.ctaUrl).toBe("/register");
  });

  it("should return COMPLETE_ONBOARDING when user does not exist in DB", async () => {
    const action = await getNextBestAction("non-existent-user-id");
    expect(action.actionType).toBe("COMPLETE_ONBOARDING");
    expect(action.ctaUrl).toBe("/onboarding");
  });
});
