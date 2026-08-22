import { describe, expect, it } from "vitest";
import { passwordChangeSchema, profileSchema } from "../lib/schemas";

describe("account setting validation", () => {
  it("accepts a profile name and distinct password change", () => { expect(profileSchema.parse({ displayName: "Nitin" }).displayName).toBe("Nitin"); expect(passwordChangeSchema.parse({ currentPassword: "previous-password", newPassword: "new-password-123" }).newPassword).toBe("new-password-123"); });
  it("rejects reusing the current password", () => expect(() => passwordChangeSchema.parse({ currentPassword: "same-password", newPassword: "same-password" })).toThrow());
});
