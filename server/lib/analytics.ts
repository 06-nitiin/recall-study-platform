function utcDateKey(date: Date) { return date.toISOString().slice(0, 10); }

export function buildHeatmap(events: Array<{ reviewedAt: Date }>, days = 28, now = new Date()) {
  const buckets = new Map<string, number>();
  for (let offset = days - 1; offset >= 0; offset -= 1) buckets.set(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset)).toISOString().slice(0, 10), 0);
  for (const event of events) { const key = utcDateKey(new Date(event.reviewedAt)); if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1); }
  return [...buckets].map(([date, count]) => ({ date, count }));
}

export function currentStreak(events: Array<{ reviewedAt: Date }>, now = new Date()) {
  const days = new Set(events.map((event) => utcDateKey(new Date(event.reviewedAt)))); let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) { const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset)).toISOString().slice(0, 10); if (!days.has(day)) return streak; streak += 1; }
  return streak;
}

export function retentionRate(events: Array<{ quality: number }>) { return events.length ? Math.round((events.filter((event) => event.quality >= 3).length / events.length) * 100) : 0; }
