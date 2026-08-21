import { describe, expect, it } from "vitest";
import { StudyAiError, buildSourceContext } from "../ai/studyAi";

describe("module-scoped study context", () => {
  it("includes only extracted source material and respects the context ceiling", () => {
    const result = buildSourceContext([{ id: 1, originalFilename: "a.md", extractedText: "a".repeat(10) }, { id: 2, originalFilename: "b.md", extractedText: null }], 7);
    expect(result).toEqual([{ id: 1, originalFilename: "a.md", extractedText: "a".repeat(7) }]);
  });
  it("rejects a module with no extracted text", () => expect(() => buildSourceContext([{ id: 1, originalFilename: "a.md", extractedText: null }])).toThrow(StudyAiError));
});
