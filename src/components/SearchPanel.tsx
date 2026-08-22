import { Search } from "lucide-react";
import { ChangeEvent, useState } from "react";
import {
  searchStudy,
  type StudyModule,
  type StudySearchResult,
} from "../lib/api";

export function SearchPanel({
  modules,
  onOpenModule,
}: {
  modules: StudyModule[];
  onOpenModule: (module: StudyModule) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudySearchResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const search = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setMessage(null);
      return;
    }

    try {
      const result = await searchStudy(value);

      setResults(result.results);
      setMessage(null);
    } catch (reason) {
      setResults([]);
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not search private study content.",
      );
    }
  };

  return (
    <section className="mx-auto mt-6 max-w-6xl rounded-2xl border border-slate-200 bg-white p-4">
      <label className="flex items-center gap-2">
        <Search className="size-4 text-slate-500" />

        <span className="sr-only">
          Search your private study content
        </span>

        <input
          className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none"
          value={query}
          onChange={search}
          placeholder="Search modules, notes, tasks, and extracted materials"
        />
      </label>

      {message && (
        <p className="mt-3 text-sm text-rose-700">
          {message}
        </p>
      )}

      {query.trim().length >= 2 && !message && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {results.length === 0 ? (
            <p className="text-sm text-slate-500">
              No private study content matched that search.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {results.map((result, index) => (
                <li
                  key={`${result.type}-${result.moduleId}-${result.title}-${index}`}
                >
                  <button
                    className="w-full py-3 text-left"
                    onClick={() => {
                      const module = modules.find(
                        (item) => item.id === result.moduleId,
                      );

                      if (module) {
                        onOpenModule(module);
                      }
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      {result.type} · {result.moduleTitle}
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {result.title}
                    </p>

                    {result.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {result.excerpt}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}