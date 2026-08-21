import { and, desc, eq, lte, or } from "drizzle-orm";
import { cardReviewStates, flashcards, materials, moduleGuides, modules, quizQuestions, quizResponses, reviewEvents, studyPreferences, studySessions, tutorMessages, users } from "../../drizzle/schema";
import { db } from "./client";
import { createModuleBackup, type ModuleBackup } from "../lib/backup";

export async function findUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

export async function findUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export async function createUser(input: { email: string; displayName: string; passwordHash: string }) {
  const now = new Date();
  const result = db.insert(users).values({ ...input, createdAt: now, updatedAt: now }).run();
  return findUserById(Number(result.lastInsertRowid));
}

export async function listModulesForUser(userId: number) {
  return db.select().from(modules).where(eq(modules.userId, userId)).orderBy(desc(modules.updatedAt)).all();
}

export async function createModuleForUser(userId: number, input: { title: string; description?: string | null }) {
  const now = new Date();
  const result = db.insert(modules).values({ userId, title: input.title, description: input.description ?? null, createdAt: now, updatedAt: now }).run();
  return getModuleForUser(Number(result.lastInsertRowid), userId);
}

export async function getModuleForUser(moduleId: number, userId: number) {
  return db.select().from(modules).where(and(eq(modules.id, moduleId), eq(modules.userId, userId))).get();
}

export async function updateModuleForUser(moduleId: number, userId: number, input: { title: string; description?: string | null }) {
  const result = db.update(modules).set({ title: input.title, description: input.description ?? null, updatedAt: new Date() }).where(and(eq(modules.id, moduleId), eq(modules.userId, userId))).run();
  return result.changes > 0 ? getModuleForUser(moduleId, userId) : undefined;
}

export async function deleteModuleForUser(moduleId: number, userId: number) {
  return db.delete(modules).where(and(eq(modules.id, moduleId), eq(modules.userId, userId))).run().changes > 0;
}

export async function listMaterialsForModule(moduleId: number) {
  return db.select().from(materials).where(eq(materials.moduleId, moduleId)).orderBy(desc(materials.createdAt)).all();
}

export async function createMaterialForModule(input: { moduleId: number; originalFilename: string; mimeType: string; byteSize: number; storageKey: string }) {
  const now = new Date();
  const result = db.insert(materials).values({ ...input, createdAt: now, updatedAt: now }).run();
  return db.select().from(materials).where(eq(materials.id, Number(result.lastInsertRowid))).get();
}

export async function getMaterialForUser(materialId: number, userId: number) {
  return db.select({ material: materials }).from(materials).innerJoin(modules, eq(materials.moduleId, modules.id)).where(and(eq(materials.id, materialId), eq(modules.userId, userId))).get()?.material;
}

export async function setMaterialExtraction(materialId: number, status: "ready" | "failed", extractedText?: string, extractionError?: string) {
  return db.update(materials).set({ extractionStatus: status, extractedText: extractedText ?? null, extractionError: extractionError ?? null, updatedAt: new Date() }).where(eq(materials.id, materialId)).run();
}

export async function deleteMaterialForUser(materialId: number, userId: number) {
  const material = await getMaterialForUser(materialId, userId);
  if (!material) return undefined;
  db.delete(materials).where(eq(materials.id, materialId)).run();
  return material;
}

export async function listReadyMaterialsForModule(moduleId: number) {
  return db.select().from(materials).where(and(eq(materials.moduleId, moduleId), eq(materials.extractionStatus, "ready"))).all();
}

export async function replaceGeneratedStudyContent(moduleId: number, content: { summary: string; concepts: unknown[]; flashcards: Array<{ prompt: string; answer: string; explanation?: string; sourceMaterialId?: number }>; quizQuestions: Array<{ prompt: string; options: Array<{ id: string; text: string }>; correctOptionId: string; explanation?: string }> }) {
  const now = new Date();
  db.transaction((tx) => {
    tx.delete(flashcards).where(and(eq(flashcards.moduleId, moduleId), eq(flashcards.isGenerated, true))).run();
    tx.delete(quizQuestions).where(and(eq(quizQuestions.moduleId, moduleId), eq(quizQuestions.isGenerated, true))).run();
    tx.insert(moduleGuides).values({ moduleId, summary: content.summary, conceptsJson: JSON.stringify(content.concepts), updatedAt: now }).onConflictDoUpdate({ target: moduleGuides.moduleId, set: { summary: content.summary, conceptsJson: JSON.stringify(content.concepts), updatedAt: now } }).run();
    if (content.flashcards.length) tx.insert(flashcards).values(content.flashcards.map((card) => ({ moduleId, prompt: card.prompt, answer: card.answer, explanation: card.explanation ?? null, sourceMaterialId: card.sourceMaterialId ?? null, createdAt: now }))).run();
    if (content.quizQuestions.length) tx.insert(quizQuestions).values(content.quizQuestions.map((question) => ({ moduleId, prompt: question.prompt, optionsJson: JSON.stringify(question.options), correctOptionId: question.correctOptionId, explanation: question.explanation ?? null, createdAt: now }))).run();
  });
}

export async function getGeneratedStudyContent(moduleId: number) {
  const guide = db.select().from(moduleGuides).where(eq(moduleGuides.moduleId, moduleId)).get();
  return { guide: guide ? { ...guide, concepts: JSON.parse(guide.conceptsJson) as unknown[] } : null, flashcards: db.select().from(flashcards).where(eq(flashcards.moduleId, moduleId)).all(), quizQuestions: db.select().from(quizQuestions).where(eq(quizQuestions.moduleId, moduleId)).all() };
}

export async function exportModuleBackupForUser(moduleId: number, userId: number) {
  const module = await getModuleForUser(moduleId, userId); if (!module) return undefined;
  const content = await getGeneratedStudyContent(module.id);
  return createModuleBackup({ module: { title: module.title, description: module.description }, guide: content.guide ? { summary: content.guide.summary, concepts: content.guide.concepts } : null, flashcards: content.flashcards.map((card) => ({ prompt: card.prompt, answer: card.answer, explanation: card.explanation })), quizQuestions: content.quizQuestions.map((question) => ({ prompt: question.prompt, options: JSON.parse(question.optionsJson) as Array<{ id: string; text: string }>, correctOptionId: question.correctOptionId, explanation: question.explanation })) });
}

export async function restoreModuleBackupForUser(userId: number, backup: ModuleBackup) {
  const now = new Date(); let moduleId = 0;
  db.transaction((tx) => { const result = tx.insert(modules).values({ userId, title: backup.module.title, description: backup.module.description ?? null, createdAt: now, updatedAt: now }).run(); moduleId = Number(result.lastInsertRowid); if (backup.guide) tx.insert(moduleGuides).values({ moduleId, summary: backup.guide.summary, conceptsJson: JSON.stringify(backup.guide.concepts), updatedAt: now }).run(); if (backup.flashcards.length) tx.insert(flashcards).values(backup.flashcards.map((card) => ({ moduleId, prompt: card.prompt, answer: card.answer, explanation: card.explanation ?? null, isGenerated: true, createdAt: now }))).run(); if (backup.quizQuestions.length) tx.insert(quizQuestions).values(backup.quizQuestions.map((question) => ({ moduleId, prompt: question.prompt, optionsJson: JSON.stringify(question.options), correctOptionId: question.correctOptionId, explanation: question.explanation ?? null, isGenerated: true, createdAt: now }))).run(); });
  return getModuleForUser(moduleId, userId);
}

export async function listDueFlashcards(userId: number, moduleId: number, now = new Date()) {
  return db.select({ card: flashcards, state: cardReviewStates }).from(flashcards).leftJoin(cardReviewStates, and(eq(cardReviewStates.flashcardId, flashcards.id), eq(cardReviewStates.userId, userId))).where(and(eq(flashcards.moduleId, moduleId), or(lte(cardReviewStates.dueAt, now), eq(cardReviewStates.id, null as unknown as number)))).all();
}

export async function recordReview(input: { userId: number; moduleId: number; flashcardId: number; rating: "again" | "hard" | "good" | "easy"; confidence: number; quality: number; repetitions: number; intervalDays: number; easeFactor: number; dueAt: Date }) {
  const now = new Date();
  const existing = db.select().from(cardReviewStates).where(and(eq(cardReviewStates.userId, input.userId), eq(cardReviewStates.flashcardId, input.flashcardId))).get();
  db.transaction((tx) => { if (existing) tx.update(cardReviewStates).set({ repetitions: input.repetitions, intervalDays: input.intervalDays, easeFactor: input.easeFactor, dueAt: input.dueAt, lastReviewedAt: now }).where(eq(cardReviewStates.id, existing.id)).run(); else tx.insert(cardReviewStates).values({ userId: input.userId, flashcardId: input.flashcardId, repetitions: input.repetitions, intervalDays: input.intervalDays, easeFactor: input.easeFactor, dueAt: input.dueAt, lastReviewedAt: now }).run(); tx.insert(reviewEvents).values({ userId: input.userId, moduleId: input.moduleId, flashcardId: input.flashcardId, rating: input.rating, confidence: input.confidence, quality: input.quality, nextIntervalDays: input.intervalDays, reviewedAt: now }).run(); });
}

export async function createQuizSession(userId: number, moduleId: number) { const result = db.insert(studySessions).values({ userId, moduleId, kind: "quiz", startedAt: new Date() }).run(); return db.select().from(studySessions).where(eq(studySessions.id, Number(result.lastInsertRowid))).get(); }
export async function recordQuizResponse(input: { userId: number; sessionId: number; questionId: number; selectedOptionId: string; confidence: number }) { const session = db.select().from(studySessions).where(and(eq(studySessions.id, input.sessionId), eq(studySessions.userId, input.userId))).get(); if (!session) return undefined; const question = db.select().from(quizQuestions).where(and(eq(quizQuestions.id, input.questionId), eq(quizQuestions.moduleId, session.moduleId))).get(); if (!question) return undefined; const isCorrect = question.correctOptionId === input.selectedOptionId; db.transaction((tx) => { tx.insert(quizResponses).values({ sessionId: session.id, questionId: question.id, selectedOptionId: input.selectedOptionId, isCorrect, confidence: input.confidence, answeredAt: new Date() }).run(); tx.update(studySessions).set({ answerCount: session.answerCount + 1, correctCount: session.correctCount + (isCorrect ? 1 : 0) }).where(eq(studySessions.id, session.id)).run(); }); return { isCorrect, explanation: question.explanation, correctOptionId: question.correctOptionId }; }

export async function listTutorMessages(moduleId: number, userId: number) { return db.select().from(tutorMessages).where(and(eq(tutorMessages.moduleId, moduleId), eq(tutorMessages.userId, userId))).orderBy(tutorMessages.createdAt).all(); }
export async function addTutorMessage(input: { moduleId: number; userId: number; role: "user" | "assistant"; content: string; citedMaterialIds?: number[] }) { const result = db.insert(tutorMessages).values({ ...input, citedMaterialIdsJson: input.citedMaterialIds ? JSON.stringify(input.citedMaterialIds) : null, createdAt: new Date() }).run(); return db.select().from(tutorMessages).where(eq(tutorMessages.id, Number(result.lastInsertRowid))).get(); }

export async function getPreferences(userId: number) { const found = db.select().from(studyPreferences).where(eq(studyPreferences.userId, userId)).get(); if (found) return found; const now = new Date(); const result = db.insert(studyPreferences).values({ userId, updatedAt: now }).run(); return db.select().from(studyPreferences).where(eq(studyPreferences.id, Number(result.lastInsertRowid))).get(); }
export async function updatePreferences(userId: number, input: { dailyGoalMinutes: number; preferredSessionMinutes: number }) { await getPreferences(userId); db.update(studyPreferences).set({ ...input, updatedAt: new Date() }).where(eq(studyPreferences.userId, userId)).run(); return getPreferences(userId); }
export async function getAnalyticsData(userId: number) { const ownedModules = await listModulesForUser(userId); const events = db.select().from(reviewEvents).where(eq(reviewEvents.userId, userId)).all(); const states = db.select().from(cardReviewStates).where(eq(cardReviewStates.userId, userId)).all(); const sessions = db.select().from(studySessions).where(eq(studySessions.userId, userId)).all(); return { modules: ownedModules, events, states, sessions }; }
