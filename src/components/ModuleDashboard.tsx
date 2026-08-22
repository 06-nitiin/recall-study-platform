import {
  BookOpen,
  BookPlus,
  LogOut,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  createModule,
  deleteModule,
  listModules,
  signOut,
  updateModule,
  type CurrentUser,
  type StudyModule,
} from "../lib/api";
import { FocusTimer } from "./FocusTimer";
import { MaterialPanel } from "./MaterialPanel";
import { ModuleBackupPanel } from "./ModuleBackupPanel";
import { ProgressPanel } from "./ProgressPanel";
import { StudyPanel } from "./StudyPanel";

export function ModuleDashboard({
  user,
  onSignedOut,
}: {
  user: CurrentUser;
  onSignedOut: () => void;
}) {
  const [modules, setModules] = useState<StudyModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    title: "",
    description: "",
  });

  const [editing, setEditing] = useState<StudyModule | null>(null);
  const [selectedModule, setSelectedModule] =
    useState<StudyModule | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setModules((await listModules()).modules);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not load modules.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();

    try {
      if (editing) {
        await updateModule(editing.id, draft);
      } else {
        await createModule(draft);
      }

      setDraft({
        title: "",
        description: "",
      });

      setEditing(null);
      await refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not save module.",
      );
    }
  };

  const edit = (module: StudyModule) => {
    setEditing(module);
    setDraft({
      title: module.title,
      description: module.description ?? "",
    });
  };

  const remove = async (module: StudyModule) => {
    if (!window.confirm(`Delete “${module.title}”?`)) {
      return;
    }

    await deleteModule(module.id);

    if (selectedModule?.id === module.id) {
      setSelectedModule(null);
    }

    await refresh();
  };

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-5 py-8 sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Private workspace
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em]">
            Hello, {user.displayName}.
          </h1>

          <p className="mt-3 max-w-xl leading-7 text-slate-600">
            Create a module for each course or subject, then attach
            private source notes.
          </p>
        </div>

        <button
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          onClick={async () => {
            await signOut();
            onSignedOut();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </header>

      <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <form
          className="rounded-[1.75rem] bg-slate-950 p-6 text-white"
          onSubmit={save}
        >
          <div className="flex items-center gap-2 text-emerald-300">
            <BookPlus className="size-5" />
            <span className="text-sm font-semibold">
              {editing ? "Edit module" : "New module"}
            </span>
          </div>

          <label className="mt-6 block text-sm font-semibold">
            Title

            <input
              className="mt-2 h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 font-normal text-white"
              value={draft.title}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  title: event.target.value,
                })
              }
              required
            />
          </label>

          <label className="mt-4 block text-sm font-semibold">
            Description{" "}
            <span className="font-normal text-slate-400">
              (optional)
            </span>

            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 font-normal text-white"
              value={draft.description}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  description: event.target.value,
                })
              }
            />
          </label>

          <button className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
            <Plus className="size-4" />
            {editing ? "Save changes" : "Create module"}
          </button>

          {editing && (
            <button
              type="button"
              className="ml-3 text-sm font-semibold text-slate-300"
              onClick={() => {
                setEditing(null);
                setDraft({
                  title: "",
                  description: "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.15em] text-emerald-700">
                Learning library
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
                Your modules
              </h2>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
              {modules.length}
            </span>
          </div>

          {error && (
            <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="mt-7 text-slate-500">
              Loading modules…
            </p>
          ) : modules.length === 0 ? (
            <p className="mt-7 rounded-xl bg-slate-50 p-5 leading-7 text-slate-600">
              No modules yet. Create your first course or subject
              on the left.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-slate-100">
              {modules.map((module) => (
                <li
                  key={module.id}
                  className="flex items-start justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-semibold">
                      {module.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {module.description ||
                        "No description yet."}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      onClick={() => setSelectedModule(module)}
                      aria-label={`Open materials for ${module.title}`}
                    >
                      <BookOpen className="size-4" />
                    </button>

                    <button
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      onClick={() => edit(module)}
                      aria-label={`Edit ${module.title}`}
                    >
                      <Pencil className="size-4" />
                    </button>

                    <button
                      className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => void remove(module)}
                      aria-label={`Delete ${module.title}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      {selectedModule && (
        <div className="mx-auto max-w-6xl">
          <MaterialPanel module={selectedModule} />
          <StudyPanel module={selectedModule} />
          <FocusTimer module={selectedModule} />

          <ModuleBackupPanel
            module={selectedModule}
            onRestored={refresh}
          />
        </div>
      )}

      <ProgressPanel />
    </main>
  );
}