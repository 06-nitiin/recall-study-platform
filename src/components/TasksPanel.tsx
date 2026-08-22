import { Check, Circle, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  listTasks,
  setTaskComplete,
  type ModuleTask,
  type StudyModule,
} from "../lib/api";

export function TasksPanel({ module }: { module: StudyModule }) {
  const [tasks, setTasks] = useState<ModuleTask[]>([]);
  const [draft, setDraft] = useState({
    title: "",
    dueDate: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setTasks((await listTasks(module.id)).tasks);
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not load tasks.",
      );
    }
  };

  useEffect(() => {
    setDraft({
      title: "",
      dueDate: "",
    });

    void refresh();
  }, [module.id]);

  const add = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await createTask(module.id, {
        title: draft.title,
        dueDate: draft.dueDate || null,
      });

      setDraft({
        title: "",
        dueDate: "",
      });

      setMessage(null);
      await refresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not add this task.",
      );
    }
  };

  const toggle = async (task: ModuleTask) => {
    try {
      await setTaskComplete(task.id, !task.completedAt);
      await refresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not update this task.",
      );
    }
  };

  const remove = async (task: ModuleTask) => {
    if (!window.confirm(`Delete “${task.title}”?`)) {
      return;
    }

    try {
      await deleteTask(task.id);
      await refresh();
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not delete this task.",
      );
    }
  };

  return (
    <section className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-emerald-700">
          Study checklist
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Module tasks
        </h2>
      </div>

      <form
        className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
        onSubmit={add}
      >
        <input
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          placeholder="Add a study task"
          value={draft.title}
          maxLength={240}
          required
          onChange={(event) =>
            setDraft({
              ...draft,
              title: event.target.value,
            })
          }
        />

        <input
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm"
          aria-label="Optional due date"
          type="date"
          value={draft.dueDate}
          onChange={(event) =>
            setDraft({
              ...draft,
              dueDate: event.target.value,
            })
          }
        />

        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
          <Plus className="size-4" />
          Add
        </button>
      </form>

      {message && (
        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {message}
        </p>
      )}

      <ul className="mt-4 divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <li className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            No tasks yet. Add the next action for this module.
          </li>
        ) : (
          tasks.map((task) => (
            <li
              className="flex items-center gap-3 py-3"
              key={task.id}
            >
              <button
                className={`rounded-full p-1 ${
                  task.completedAt
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
                aria-label={`${
                  task.completedAt
                    ? "Mark incomplete"
                    : "Mark complete"
                }: ${task.title}`}
                onClick={() => void toggle(task)}
              >
                {task.completedAt ? (
                  <Check className="size-4" />
                ) : (
                  <Circle className="size-4" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    task.completedAt
                      ? "text-slate-400 line-through"
                      : "text-slate-900"
                  }`}
                >
                  {task.title}
                </p>

                {task.dueDate && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Due {task.dueDate}
                  </p>
                )}
              </div>

              <button
                className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                aria-label={`Delete ${task.title}`}
                onClick={() => void remove(task)}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}