import { describe, expect, it } from "vitest";
import { elapsedFocusSeconds } from "../lib/focusSessions";

describe("focus session duration", () => {
  it("uses server timestamps and ignores sub-second elapsed time", () => expect(elapsedFocusSeconds(new Date("2026-08-21T12:00:00Z"), new Date("2026-08-21T12:07:45.900Z"))).toBe(465));
  it("caps a single focus session at four hours", () => expect(elapsedFocusSeconds(new Date("2026-08-21T00:00:00Z"), new Date("2026-08-22T00:00:00Z"))).toBe(14_400));
});
