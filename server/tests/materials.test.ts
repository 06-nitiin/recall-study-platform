import { describe, expect, it } from "vitest";
import { MaterialError, MAX_EXTRACTED_TEXT_CHARS, normalizeExtractedText, validateMaterialUpload } from "../lib/materials";

describe("material validation and extraction", () => {
  it("accepts supported text materials and rejects mismatched files", () => {
    expect(validateMaterialUpload({ filename: "notes.md", mimeType: "text/markdown", byteSize: 20 })).toMatchObject({ filename: "notes.md", mimeType: "text/markdown" });
    expect(() => validateMaterialUpload({ filename: "slides.pdf", mimeType: "text/plain", byteSize: 20 })).toThrow(MaterialError);
  });
  it("normalizes readable text and bounds the stored result", () => {
    expect(normalizeExtractedText(Buffer.from("  Hello\r\n\r\n\r\n  Recall  "))).toBe("Hello\n\nRecall");
    expect(normalizeExtractedText(Buffer.from("x".repeat(MAX_EXTRACTED_TEXT_CHARS + 9)))).toHaveLength(MAX_EXTRACTED_TEXT_CHARS);
  });
});
