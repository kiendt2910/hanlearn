import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

describe("Authentication validation schemas", () => {
  it("normalizes and validates valid login input", () => {
    const parsed = loginSchema.parse({
      email: "  Learner@HanLearn.Local  ",
      password: "Password123",
    });
    expect(parsed.email).toBe("learner@hanlearn.local");
  });

  it("rejects weak registration passwords and mismatched confirmations", () => {
    const weak = registerSchema.safeParse({
      displayName: "Minh",
      email: "minh@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(weak.success).toBe(false);

    const mismatch = registerSchema.safeParse({
      displayName: "Minh",
      email: "minh@example.com",
      password: "Password123",
      confirmPassword: "Password456",
    });
    expect(mismatch.success).toBe(false);
  });

  it("accepts valid Vietnamese display names and strong passwords", () => {
    const valid = registerSchema.safeParse({
      displayName: "Nguyễn Minh Anh",
      email: "minhanh@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    });
    expect(valid.success).toBe(true);
  });
});
