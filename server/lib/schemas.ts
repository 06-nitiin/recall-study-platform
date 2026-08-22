import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, "Enter at least two characters for your name.").max(80),
  email: z.string().trim().email("Enter a valid email address.").max(320).transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Use at least eight characters for your password.").max(128),
});

export const signInSchema = registerSchema.pick({ email: true, password: true });

export const moduleSchema = z.object({
  title: z.string().trim().min(1, "A module title is required.").max(160),
  description: z.string().trim().max(1_000).nullable().optional(),
});

export const noteSchema = z.object({
  title: z.string().trim().min(1, "A note title is required.").max(160),
  body: z.string().trim().min(1, "Write something before saving the note.").max(20_000),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "A task title is required.").max(240),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid due date.").nullable().optional(),
});

export const flashcardSchema = z.object({
  prompt: z.string().trim().min(1, "A flashcard prompt is required.").max(2_000),
  answer: z.string().trim().min(1, "A flashcard answer is required.").max(8_000),
  explanation: z.string().trim().max(8_000).nullable().optional(),
});

export const manualQuizQuestionSchema = z.object({
  prompt: z.string().trim().min(1, "A quiz question is required.").max(2_000),
  options: z.array(z.object({ id: z.string().trim().min(1).max(80), text: z.string().trim().min(1, "Each option needs text.").max(2_000) })).min(2).max(6),
  correctOptionId: z.string().trim().min(1).max(80),
  explanation: z.string().trim().max(8_000).nullable().optional(),
}).superRefine((question, context) => { if (!question.options.some((option) => option.id === question.correctOptionId)) context.addIssue({ code: "custom", message: "Choose one of the listed options as correct.", path: ["correctOptionId"] }); });

export const profileSchema = z.object({ displayName: z.string().trim().min(2, "Enter at least two characters for your name.").max(80) });
export const passwordChangeSchema = z.object({ currentPassword: z.string().min(1, "Enter your current password."), newPassword: z.string().min(8, "Use at least eight characters for your new password.").max(128) }).refine((value) => value.currentPassword !== value.newPassword, { message: "Choose a different new password.", path: ["newPassword"] });
