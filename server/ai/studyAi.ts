import { z } from "zod";

const generatedSchema = z.object({
  summary: z.string().min(1).max(3000),
  concepts: z.array(z.object({ title: z.string().min(1), explanation: z.string().min(1), sourceMaterialId: z.number().int().positive() })).min(1).max(12),
  flashcards: z.array(z.object({ prompt: z.string().min(1), answer: z.string().min(1), explanation: z.string().optional(), sourceMaterialId: z.number().int().positive() })).min(3).max(24),
  quizQuestions: z.array(z.object({ prompt: z.string().min(1), options: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).length(4), correctOptionId: z.string().min(1), explanation: z.string().optional() })).min(3).max(12),
});

const tutorSchema = z.object({ answer: z.string().min(1), citedMaterialIds: z.array(z.number().int().positive()).max(8) });
export class StudyAiError extends Error {}

export function buildSourceContext(materials: Array<{ id: number; originalFilename: string; extractedText: string | null }>, maxCharacters = 60_000) {
  let remaining = maxCharacters; const included: Array<{ id: number; originalFilename: string; extractedText: string }> = [];
  for (const material of materials) { if (!material.extractedText || remaining <= 0) continue; const extractedText = material.extractedText.slice(0, remaining); included.push({ id: material.id, originalFilename: material.originalFilename, extractedText }); remaining -= extractedText.length; }
  if (!included.length) throw new StudyAiError("Extract text from at least one material before using AI study tools.");
  return included;
}

async function complete(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  const key = process.env.OPENAI_API_KEY; if (!key) throw new StudyAiError("Set OPENAI_API_KEY in your local .env file before using AI study tools.");
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.2, response_format: { type: "json_object" }, messages }) });
  const payload = await response.json().catch(() => ({})) as { error?: { message?: string }; choices?: Array<{ message?: { content?: string } }> };
  if (!response.ok) throw new StudyAiError(payload.error?.message || "The AI provider did not accept this request.");
  const content = payload.choices?.[0]?.message?.content; if (!content) throw new StudyAiError("The AI provider returned no content.");
  try { return JSON.parse(content) as unknown; } catch { throw new StudyAiError("The AI provider returned invalid structured content."); }
}

export async function generateStudyContent(materials: Array<{ id: number; originalFilename: string; extractedText: string | null }>) {
  const sources = buildSourceContext(materials); const sourceText = sources.map((source) => `[Material ${source.id}: ${source.originalFilename}]\n${source.extractedText}`).join("\n\n");
  const value = generatedSchema.parse(await complete([{ role: "system", content: "Return only JSON. Create accurate study content only from the supplied material. Every concept and flashcard must name a valid sourceMaterialId. Quiz options must include the correctOptionId." }, { role: "user", content: sourceText }]));
  const allowed = new Set(sources.map((source) => source.id)); if (value.concepts.some((item) => !allowed.has(item.sourceMaterialId)) || value.flashcards.some((item) => !allowed.has(item.sourceMaterialId)) || value.quizQuestions.some((question) => !question.options.some((option) => option.id === question.correctOptionId))) throw new StudyAiError("The AI response failed source validation.");
  return value;
}

export async function answerTutorQuestion(input: { question: string; materials: Array<{ id: number; originalFilename: string; extractedText: string | null }>; history: Array<{ role: "user" | "assistant"; content: string }> }) {
  const sources = buildSourceContext(input.materials, 40_000); const allowed = new Set(sources.map((source) => source.id)); const sourceText = sources.map((source) => `[Material ${source.id}: ${source.originalFilename}]\n${source.extractedText}`).join("\n\n");
  const value = tutorSchema.parse(await complete([{ role: "system", content: "Return only JSON with answer and citedMaterialIds. Answer only from the supplied module material. If the answer is absent, say so. Cite only valid material IDs." }, ...input.history.slice(-8), { role: "user", content: `Sources:\n${sourceText}\n\nQuestion: ${input.question}` }]));
  if (value.citedMaterialIds.some((id) => !allowed.has(id))) throw new StudyAiError("The tutor response failed source validation."); return value;
}
