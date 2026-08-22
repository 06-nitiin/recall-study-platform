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
