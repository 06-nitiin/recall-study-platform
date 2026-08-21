import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

const rootDirectory = join(process.cwd(), "uploads", "materials");

export async function storePrivateMaterial(data: Buffer, extension: string) {
  const key = `materials/${randomUUID()}${extension}`;
  const path = join(process.cwd(), "uploads", key);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data, { flag: "wx" });
  return key;
}

export async function readPrivateMaterial(storageKey: string) {
  if (!storageKey.startsWith("materials/")) throw new Error("Invalid material storage key.");
  return readFile(join(process.cwd(), "uploads", storageKey));
}

export async function removePrivateMaterial(storageKey: string) {
  if (!storageKey.startsWith("materials/")) return;
  await rm(join(process.cwd(), "uploads", storageKey), { force: true });
}

export { rootDirectory };
