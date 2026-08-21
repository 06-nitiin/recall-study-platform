import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../auth/passwords";
import { registerSchema, signInSchema } from "../lib/schemas";

describe("local authentication", () => {
  it("normalizes an email and requires a strong-enough registration password", () => {
    expect(registerSchema.parse({ displayName: "Nitin", email: " NITIN@EXAMPLE.COM ", password: "securepass" }).email).toBe("nitin@example.com");
    expect(registerSchema.safeParse({ displayName: "N", email: "nope", password: "tiny" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "valid@example.com", password: "securepass" }).success).toBe(true);
  });

  it("hashes passwords and verifies only the matching value", async () => {
    const hash = await hashPassword("securepass");
    await expect(verifyPassword("securepass", hash)).resolves.toBe(true);
    await expect(verifyPassword("incorrect", hash)).resolves.toBe(false);
  });
});
