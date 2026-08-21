import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { env } from "../env";

function sqliteFilePath(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:")) throw new Error("DATABASE_URL must begin with file: for this local SQLite foundation.");
  return resolve(databaseUrl.slice("file:".length));
}

const databasePath = sqliteFilePath(env.DATABASE_URL);
mkdirSync(dirname(databasePath), { recursive: true });
const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
export const db = drizzle(sqlite);
