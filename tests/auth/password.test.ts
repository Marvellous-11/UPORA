import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("Password Security & Hashing", () => {
  it("should hash passwords securely and verify matching plaintext", async () => {
    const plaintext = "SecureSecretPassword123!";
    const hash = await hashPassword(plaintext);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plaintext);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix

    const isMatch = await verifyPassword(plaintext, hash);
    expect(isMatch).toBe(true);
  });

  it("should reject incorrect passwords", async () => {
    const plaintext = "CorrectPassword123!";
    const wrongPassword = "WrongPassword456!";
    const hash = await hashPassword(plaintext);

    const isMatch = await verifyPassword(wrongPassword, hash);
    expect(isMatch).toBe(false);
  });

  it("should reject passwords under 8 characters", async () => {
    await expect(hashPassword("short")).rejects.toThrow(
      "Password must be at least 8 characters"
    );
  });
});
