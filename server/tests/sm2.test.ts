import { describe, expect, it } from "vitest";
import { scheduleReview } from "../lib/sm2";

describe("adaptive review scheduler", () => {
  it("schedules successful new cards at one day then six days", () => {
    const first = scheduleReview(undefined, "good", 3, new Date("2026-01-01"));
    const second = scheduleReview(first, "good", 3, new Date("2026-01-02"));
    expect(first.intervalDays).toBe(1); expect(second.intervalDays).toBe(6);
  });
  it("resets a lapse for a short retry with a minimum ease factor", () => {
    const next = scheduleReview({ repetitions: 5, intervalDays: 20, easeFactor: 131 }, "again", 1, new Date("2026-01-01"));
    expect(next).toMatchObject({ repetitions: 0, intervalDays: 0, easeFactor: 130 });
  });
});
