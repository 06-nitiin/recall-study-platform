import { describe, expect, it } from "vitest";
import { noteSchema } from "../lib/schemas";

describe("module note validation", () => {
  it("accepts a concise private note", () => expect(noteSchema.parse({ title: "Formula", body: "F = ma" })).toMatchObject({ title: "Formula", body: "F = ma" }));
  it("rejects empty notes before persistence", () => expect(() => noteSchema.parse({ title: "", body: "" })).toThrow());
});
