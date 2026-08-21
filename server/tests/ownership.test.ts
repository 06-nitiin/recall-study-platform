import { describe, expect, it } from "vitest";
import { isOwnedByUser } from "../lib/ownership";

describe("module ownership", () => {
  it("permits only the account that owns a resource", () => {
    expect(isOwnedByUser(12, 12)).toBe(true);
    expect(isOwnedByUser(12, 13)).toBe(false);
  });
});
