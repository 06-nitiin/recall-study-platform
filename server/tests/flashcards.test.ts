import { describe, expect, it } from "vitest";
import { flashcardSchema } from "../lib/schemas";

describe("manual flashcard validation", () => {
  it("accepts a complete prompt and answer", () => expect(flashcardSchema.parse({ prompt: "What is osmosis?", answer: "Movement of water across a membrane." })).toMatchObject({ prompt: "What is osmosis?" }));
  it("rejects an empty answer", () => expect(() => flashcardSchema.parse({ prompt: "Question", answer: "" })).toThrow());
});
