export type SearchCandidate = {
  type: "module" | "note" | "task" | "material";
  moduleId: number;
  moduleTitle: string;
  title: string;
  content: string;
};

export function searchCandidates(
  candidates: SearchCandidate[],
  query: string,
  limit = 20,
) {
  const needle = query.trim().toLocaleLowerCase();

  if (needle.length < 2) {
    return [];
  }

  return candidates
    .map((candidate) => {
      const title = candidate.title.toLocaleLowerCase();
      const content = candidate.content.toLocaleLowerCase();

      const score =
        (title.includes(needle) ? 4 : 0) +
        (content.includes(needle) ? 1 : 0) +
        (candidate.moduleTitle.toLocaleLowerCase().includes(needle) ? 2 : 0);

      return {
        ...candidate,
        score,
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.title.localeCompare(right.title),
    )
    .slice(0, limit)
    .map(({ score: _score, ...candidate }) => ({
      ...candidate,
      excerpt: candidate.content.replace(/\s+/g, " ").slice(0, 180),
    }));
}