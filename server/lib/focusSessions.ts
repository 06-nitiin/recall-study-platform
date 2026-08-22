export function elapsedFocusSeconds(startedAt: Date, endedAt = new Date()) {
  return Math.min(14_400, Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1_000)));
}
