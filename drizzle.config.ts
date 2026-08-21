import { defineConfig } from "drizzle-kit";

const candidateUrl = process.env.DATABASE_URL;
const databaseUrl = candidateUrl?.startsWith("file:") ? candidateUrl : "file:./data/recall.db";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: { url: databaseUrl.replace(/^file:/, "") },
});
