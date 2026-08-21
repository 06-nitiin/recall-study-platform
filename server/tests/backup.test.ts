import { describe, expect, it } from "vitest";
import { createModuleBackup, moduleBackupSchema } from "../lib/backup";

describe("portable module backups", () => {
  it("creates a versioned portable document with learning content only", () => {
    const backup = createModuleBackup({ module: { title: "Biology", description: null }, guide: null, flashcards: [{ prompt: "What is ATP?", answer: "Cellular energy currency" }], quizQuestions: [] }, new Date("2026-08-21T12:00:00.000Z"));
    expect(backup).toMatchObject({ format: "recall-module-backup", version: 1, exportedAt: "2026-08-21T12:00:00.000Z" }); expect(JSON.stringify(backup)).not.toContain("uploads");
  });
  it("rejects an imported question whose answer does not match an option", () => expect(() => moduleBackupSchema.parse({ format: "recall-module-backup", version: 1, exportedAt: "2026-08-21T12:00:00.000Z", module: { title: "Biology" }, flashcards: [], quizQuestions: [{ prompt: "Question?", options: [{ id: "a", text: "A" }, { id: "b", text: "B" }], correctOptionId: "missing" }] })).toThrow());
});
