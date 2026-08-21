import { describe, expect, it } from "vitest";
import { buildHeatmap, currentStreak, retentionRate } from "../lib/analytics";

describe("study analytics", () => {
  const now = new Date("2026-08-21T12:00:00Z");
  it("calculates retention and a UTC-stable consecutive activity streak", () => {
    const events = [{ reviewedAt: now, quality: 4 }, { reviewedAt: new Date("2026-08-20T12:00:00Z"), quality: 2 }];
    expect(retentionRate(events)).toBe(50); expect(currentStreak(events, now)).toBe(2);
  });
  it("returns one bucket per requested heatmap day", () => expect(buildHeatmap([], 7, now)).toHaveLength(7));
});
