import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type User = typeof users.$inferSelect;

export const modules = sqliteTable("modules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type StudyModule = typeof modules.$inferSelect;

export const materials = sqliteTable("materials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  extractionStatus: text("extraction_status", { enum: ["uploaded", "ready", "failed"] }).notNull().default("uploaded"),
  extractionError: text("extraction_error"),
  extractedText: text("extracted_text"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type StudyMaterial = typeof materials.$inferSelect;

export const moduleGuides = sqliteTable("module_guides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().unique().references(() => modules.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  conceptsJson: text("concepts_json").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const flashcards = sqliteTable("flashcards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  sourceMaterialId: integer("source_material_id").references(() => materials.id, { onDelete: "set null" }),
  prompt: text("prompt").notNull(),
  answer: text("answer").notNull(),
  explanation: text("explanation"),
  isGenerated: integer("is_generated", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const quizQuestions = sqliteTable("quiz_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  optionsJson: text("options_json").notNull(),
  correctOptionId: text("correct_option_id").notNull(),
  explanation: text("explanation"),
  isGenerated: integer("is_generated", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const cardReviewStates = sqliteTable("card_review_states", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  flashcardId: integer("flashcard_id").notNull().unique().references(() => flashcards.id, { onDelete: "cascade" }),
  repetitions: integer("repetitions").notNull().default(0),
  intervalDays: integer("interval_days").notNull().default(0),
  easeFactor: integer("ease_factor").notNull().default(250),
  dueAt: integer("due_at", { mode: "timestamp_ms" }).notNull(),
  lastReviewedAt: integer("last_reviewed_at", { mode: "timestamp_ms" }),
});

export const reviewEvents = sqliteTable("review_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  flashcardId: integer("flashcard_id").notNull().references(() => flashcards.id, { onDelete: "cascade" }),
  rating: text("rating", { enum: ["again", "hard", "good", "easy"] }).notNull(),
  confidence: integer("confidence").notNull(),
  quality: integer("quality").notNull(),
  nextIntervalDays: integer("next_interval_days").notNull(),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }).notNull(),
});

export const studySessions = sqliteTable("study_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["flashcard", "quiz"] }).notNull(),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp_ms" }),
  correctCount: integer("correct_count").notNull().default(0),
  answerCount: integer("answer_count").notNull().default(0),
});

export const quizResponses = sqliteTable("quiz_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => studySessions.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => quizQuestions.id, { onDelete: "cascade" }),
  selectedOptionId: text("selected_option_id").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  confidence: integer("confidence").notNull(),
  answeredAt: integer("answered_at", { mode: "timestamp_ms" }).notNull(),
});

export const tutorMessages = sqliteTable("tutor_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  citedMaterialIdsJson: text("cited_material_ids_json"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const studyPreferences = sqliteTable("study_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(20),
  preferredSessionMinutes: integer("preferred_session_minutes").notNull().default(15),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
