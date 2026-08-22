import { describe, expect, it } from "vitest";
import { manualQuizQuestionSchema } from "../lib/schemas";

describe("manual quiz question validation", () => {
  const base = { prompt: "Which option is correct?", options: [{ id: "a", text: "A" }, { id: "b", text: "B" }], correctOptionId: "a" };
  it("accepts a question whose correct option exists", () => expect(manualQuizQuestionSchema.parse(base).correctOptionId).toBe("a"));
  it("rejects a missing correct option", () => expect(() => manualQuizQuestionSchema.parse({ ...base, correctOptionId: "c" })).toThrow());
});
