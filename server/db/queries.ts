import { and, desc, eq } from "drizzle-orm";
import { materials, modules, users } from "../../drizzle/schema";
import { db } from "./client";

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
