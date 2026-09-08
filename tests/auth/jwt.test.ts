import { describe, it, expect } from "vitest";
import { createSessionToken, verifySessionToken, SessionPayload } from "@/lib/auth/jwt";
import { GlobalRole } from "@prisma/client";

describe("JWT Session Security", () => {
  const samplePayload: SessionPayload = {
    userId: "usr-test-101",
    email: "worker@upora.org",
    role: GlobalRole.WORKER,
    fullName: "Marvellous Esohwode",
  };

  it("should generate a verifiable signed session token", async () => {
    const token = await createSessionToken(samplePayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // Header.Payload.Signature

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(samplePayload.userId);
    expect(verified?.email).toBe(samplePayload.email);
    expect(verified?.role).toBe(GlobalRole.WORKER);
    expect(verified?.fullName).toBe(samplePayload.fullName);
  });

  it("should reject tampered or corrupt tokens", async () => {
    const token = await createSessionToken(samplePayload);
    const tampered = token.slice(0, -5) + "abcde";

    const verified = await verifySessionToken(tampered);
    expect(verified).toBeNull();
  });

  it("should reject completely invalid token strings", async () => {
    const verified = await verifySessionToken("invalid.token.string");
    expect(verified).toBeNull();
  });
});
