import { describe, expect, it } from "vitest";
import { taskSchema } from "../lib/schemas";

describe("module task validation", () => {
  it("accepts a task with an optional date", () => expect(taskSchema.parse({ title: "Review chapter 4", dueDate: "2026-09-01" })).toMatchObject({ title: "Review chapter 4", dueDate: "2026-09-01" }));
  it("rejects malformed task dates", () => expect(() => taskSchema.parse({ title: "Review", dueDate: "1 September" })).toThrow());
});
