export type ReviewRating = "again" | "hard" | "good" | "easy";
export type ReviewState = { repetitions: number; intervalDays: number; easeFactor: number };

export function scheduleReview(state: ReviewState | undefined, rating: ReviewRating, confidence: number, now = new Date()) {
  const baseQuality = { again: 1, hard: 3, good: 4, easy: 5 }[rating];
  const quality = Math.min(5, Math.max(0, baseQuality + (confidence <= 2 ? -1 : confidence === 5 ? 1 : 0)));
  const previous = state ?? { repetitions: 0, intervalDays: 0, easeFactor: 250 };
  if (quality < 3) return { quality, repetitions: 0, intervalDays: 0, easeFactor: Math.max(130, previous.easeFactor - 20), dueAt: new Date(now.getTime() + 10 * 60_000) };
  const easeFactor = Math.max(130, previous.easeFactor + Math.round((0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)) * 100));
  const repetitions = previous.repetitions + 1;
  const intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round(Math.max(1, previous.intervalDays) * (easeFactor / 100)));
  return { quality, repetitions, intervalDays, easeFactor, dueAt: new Date(now.getTime() + intervalDays * 86_400_000) };
}
