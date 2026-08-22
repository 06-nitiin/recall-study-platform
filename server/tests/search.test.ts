import { describe, expect, it } from "vitest";

import { searchCandidates } from "../lib/search";

describe("study search ranking", () => {
  const candidates = [
    {
      type: "note" as const,
      moduleId: 1,
      moduleTitle: "Biology",
      title: "Cell respiration",
      content: "ATP is an energy carrier.",
    },
    {
      type: "task" as const,
      moduleId: 1,
      moduleTitle: "Biology",
      title: "Review notes",
      content: "Prepare for the respiration quiz.",
    },
  ];

  it("ranks title matches above body-only matches", () =>
    expect(
      searchCandidates(candidates, "respiration").map(
        (result) => result.title,
      ),
    ).toEqual(["Cell respiration", "Review notes"]));

  it("requires a meaningful query before returning data", () =>
    expect(searchCandidates(candidates, "a")).toEqual([]));
});