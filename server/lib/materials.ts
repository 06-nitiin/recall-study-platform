import { extname, basename } from "node:path";

export const MAX_MATERIAL_BYTES = 2 * 1024 * 1024;
export const MAX_EXTRACTED_TEXT_CHARS = 200_000;

const allowedTypes: Record<string, string[]> = {
  "text/plain": [".txt", ".text"],
  "text/markdown": [".md", ".markdown"],
};

export class MaterialError extends Error {}

export function validateMaterialUpload({ filename, mimeType, byteSize }: { filename?: string; mimeType?: string; byteSize: number }) {
  const safeFilename = basename((filename ?? "").replace(/\\/g, "/")).replace(/[^a-zA-Z0-9._ -]/g, "_").trim();
  const normalizedType = mimeType?.split(";", 1)[0]?.toLowerCase() ?? "";
  const extension = extname(safeFilename).toLowerCase();
  if (!safeFilename || safeFilename === "." || safeFilename === "..") throw new MaterialError("Choose a file with a valid name.");
  if (!allowedTypes[normalizedType]?.includes(extension)) throw new MaterialError("Upload a plain-text (.txt) or Markdown (.md) file with a matching file type.");
  if (!Number.isSafeInteger(byteSize) || byteSize <= 0) throw new MaterialError("The selected file is empty or invalid.");
  if (byteSize > MAX_MATERIAL_BYTES) throw new MaterialError("Each material must be 2 MB or smaller.");
  return { filename: safeFilename.slice(0, 180), mimeType: normalizedType, extension };
}

export function normalizeExtractedText(content: Buffer) {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(content)
    .replace(/\u0000/g, "").replace(/\r\n?/g, "\n")
    .replace(/[\t ]+\n/g, "\n").replace(/\n[\t ]+/g, "\n").replace(/\n{3,}/g, "\n\n")
    .replace(/[\t ]{2,}/g, " ").trim();
  if (!text) throw new MaterialError("No readable text was found in this material.");
  return text.slice(0, MAX_EXTRACTED_TEXT_CHARS);
}
