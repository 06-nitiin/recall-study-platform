import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
  type ModuleNote,
  type StudyModule,
} from "../lib/api";

export function NotesPanel({
  module,
}: {
  module: StudyModule;
}) {
  const [notes, setNotes] = useState<ModuleNote[]>([]);
  const [draft, setDraft] = useState({
    title: "",
    body: "",
  });
  const [editing, setEditing] = useState<ModuleNote | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setNotes((await listNotes(module.id)).notes);
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not load notes.",
      );
    }
  };

  useEffect(() => {
    setDraft({
      title: "",
      body: "",
    });
    setEditing(null);
    void refresh();
  }, [module.id]);

  const save = async (event: FormEvent) => {
    event.preventDefault();

    try {
      if (editing) {
        await updateNote(editing.id, draft);
      } else {
        await createNote(module.id, draft);
      }

      setDraft({
        title: "",
        body: "",
      });
      setEditing(null);
      setMessage(null);

      await refresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not save this note.",
      );
    }
  };

  const remove = async (note: ModuleNote) => {
    if (!window.confirm(`Delete “${note.title}”?`)) {
      return;
    }

    try {
      await deleteNote(note.id);

      if (editing?.id === note.id) {
        setEditing(null);
        setDraft({
          title: "",
          body: "",
        });
      }

      await refresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not delete this note.",
      );
    }
  };

  return (
    <section className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <FileText className="size-5 text-emerald-700" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-emerald-700">
            Private notes
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Study notes
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <form
          className="rounded-xl bg-slate-50 p-4"
          onSubmit={save}
        >
          <p className="text-sm font-semibold">
            {editing ? "Edit note" : "New note"}
          </p>

          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Title

            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              value={draft.title}
              maxLength={160}
              required
              onChange={(event) =>
                setDraft({
                  ...draft,
                  title: event.target.value,
                })
              }
            />
          </label>

          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Note

            <textarea
              className="mt-1 min-h-36 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
              value={draft.body}
              maxLength={20_000}
              required
              onChange={(event) =>
                setDraft({
                  ...draft,
                  body: event.target.value,
                })
              }
            />
          </label>

          <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
            <Plus className="size-4" />

            {editing ? "Save note" : "Add note"}
          </button>

          {editing && (
            <button
              type="button"
              className="ml-3 text-sm font-semibold text-slate-600"
              onClick={() => {
                setEditing(null);
                setDraft({
                  title: "",
                  body: "",
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

          {notes.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              No private notes yet. Capture key ideas, questions, or
              reminders here.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notes.map((note) => (
                <li className="py-4" key={note.id}>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {note.title}
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {note.body}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        aria-label={`Edit ${note.title}`}
                        onClick={() => {
                          setEditing(note);
                          setDraft({
                            title: note.title,
                            body: note.body,
                          });
                        }}
                      >
                        <Pencil className="size-4" />
                      </button>

                      <button
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Delete ${note.title}`}
                        onClick={() => void remove(note)}
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