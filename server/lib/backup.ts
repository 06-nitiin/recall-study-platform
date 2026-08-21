import { z } from "zod";
import { moduleSchema } from "./schemas";

const cardSchema = z.object({ prompt: z.string().trim().min(1).max(2_000), answer: z.string().trim().min(1).max(8_000), explanation: z.string().trim().max(8_000).nullable().optional() });
const questionSchema = z.object({ prompt: z.string().trim().min(1).max(2_000), options: z.array(z.object({ id: z.string().trim().min(1).max(80), text: z.string().trim().min(1).max(2_000) })).min(2).max(6), correctOptionId: z.string().trim().min(1).max(80), explanation: z.string().trim().max(8_000).nullable().optional() }).superRefine((question, context) => { if (!question.options.some((option) => option.id === question.correctOptionId)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Each question must identify one of its options as correct." }); });

export const moduleBackupSchema = z.object({
  format: z.literal("recall-module-backup"), version: z.literal(1), exportedAt: z.string().datetime(), module: moduleSchema,
  guide: z.object({ summary: z.string().trim().min(1).max(30_000), concepts: z.array(z.unknown()).max(100) }).nullable().optional(),
  flashcards: z.array(cardSchema).max(120), quizQuestions: z.array(questionSchema).max(50),
});

export type ModuleBackup = z.infer<typeof moduleBackupSchema>;

export function createModuleBackup(input: Omit<ModuleBackup, "format" | "version" | "exportedAt">, now = new Date()): ModuleBackup {
  return { format: "recall-module-backup", version: 1, exportedAt: now.toISOString(), ...input };
}
