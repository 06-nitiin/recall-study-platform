import { and, desc, eq } from "drizzle-orm";
import { modules, users } from "../../drizzle/schema";
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
