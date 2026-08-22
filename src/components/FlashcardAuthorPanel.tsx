import { Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  createManualFlashcard,
  deleteManualFlashcard,
  getStudyContent,
  updateManualFlashcard,
  type Flashcard,
  type StudyModule,
} from "../lib/api";

export function FlashcardAuthorPanel({ module }: { module: StudyModule }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [draft, setDraft] = useState({
    prompt: "",
    answer: "",
    explanation: "",
  });
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setCards(
        (await getStudyContent(module.id)).flashcards.filter(
          (card) => !card.isGenerated
        )
      );
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not load manual flashcards."
      );
    }
  };

  useEffect(() => {
    setDraft({
      prompt: "",
      answer: "",
      explanation: "",
    });
    setEditing(null);

    void refresh();
  }, [module.id]);

  const save = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const input = {
        ...draft,
        explanation: draft.explanation || null,
      };

      if (editing) {
        await updateManualFlashcard(editing.id, input);
      } else {
        await createManualFlashcard(module.id, input);
      }

      setDraft({
        prompt: "",
        answer: "",
        explanation: "",
      });
      setEditing(null);
      setMessage(null);

      await refresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not save this flashcard."
      );
    }
  };

  const remove = async (card: Flashcard) => {
    if (!window.confirm("Delete this manual flashcard?")) {
      return;
    }

    try {
      await deleteManualFlashcard(card.id);

      if (editing?.id === card.id) {
        setEditing(null);
        setDraft({
          prompt: "",
          answer: "",
          explanation: "",
        });
      }

      await refresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not delete this flashcard."
      );
    }
  };

  return (
    <section className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-emerald-700">
          Your cards
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Manual flashcards
        </h2>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <form
          className="rounded-xl bg-slate-50 p-4"
          onSubmit={save}
        >
          <p className="text-sm font-semibold">
            {editing ? "Edit flashcard" : "New flashcard"}
          </p>

          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Prompt

            <textarea
              className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
              value={draft.prompt}
              maxLength={2_000}
              required
              onChange={(event) =>
                setDraft({
                  ...draft,
                  prompt: event.target.value,
                })
              }
            />
          </label>

          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Answer

            <textarea
              className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
              value={draft.answer}
              maxLength={8_000}
              required
              onChange={(event) =>
                setDraft({
                  ...draft,
                  answer: event.target.value,
                })
              }
            />
          </label>

          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Explanation{" "}
            <span className="font-normal">(optional)</span>

            <textarea
              className="mt-1 min-h-16 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
              value={draft.explanation}
              maxLength={8_000}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  explanation: event.target.value,
                })
              }
            />
          </label>

          <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
            <Plus className="size-4" />
            {editing ? "Save card" : "Add card"}
          </button>

          {editing && (
            <button
              type="button"
              className="ml-3 text-sm font-semibold text-slate-600"
              onClick={() => {
                setEditing(null);
                setDraft({
                  prompt: "",
                  answer: "",
                  explanation: "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <div>
          {message && (
            <p className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {message}
            </p>
          )}

          {cards.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              No manual flashcards yet. Generated cards remain separate and
              are not changed here.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {cards.map((card) => (
                <li className="py-4" key={card.id}>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {card.prompt}
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {card.answer}
                      </p>

                      {card.explanation && (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {card.explanation}
                        </p>
                      )}
                    </div>

                    <div className="flex h-fit shrink-0 gap-1">
                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Edit manual flashcard"
                        onClick={() => {
                          setEditing(card);
                          setDraft({
                            prompt: card.prompt,
                            answer: card.answer,
                            explanation: card.explanation ?? "",
                          });
                        }}
                      >
                        <Pencil className="size-4" />
                      </button>

                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        aria-label="Delete manual flashcard"
                        onClick={() => void remove(card)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}