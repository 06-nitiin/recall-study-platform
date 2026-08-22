import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import {
  finishFocusSession,
  startFocusSession,
  type StudyModule,
} from "../lib/api";

function display(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;
}

export function FocusTimer({
  module,
}: {
  module: StudyModule;
}) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const running = sessionId !== null;

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    setSessionId(null);
    setSeconds(0);
    setMessage(null);
  }, [module.id]);

  const toggle = async () => {
    try {
      if (sessionId === null) {
        const result = await startFocusSession(module.id);

        setSessionId(result.session.id);
        setSeconds(0);
        setMessage(null);
      } else {
        const result = await finishFocusSession(sessionId);

        setSessionId(null);
        setSeconds(result.durationSeconds);
        setMessage(
          `Saved ${Math.max(
            1,
            Math.floor(result.durationSeconds / 60),
          )} focused minute${
            result.durationSeconds >= 120 ? "s" : ""
          }.`,
        );
      }
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Could not save this focus session.",
      );
    }
  };

  return (
    <section className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-[.15em] text-emerald-300">
        Focus session
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-4xl font-semibold tabular-nums">
          {display(seconds)}
        </p>

        <button
          type="button"
          onClick={() => void toggle()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950"
        >
          {running ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}

          {running ? "Finish session" : "Start focus"}
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-300">
        Your finished duration is calculated and stored from server
        timestamps.
      </p>

      {message && (
        <p
          className="mt-2 text-sm text-emerald-200"
          role="status"
        >
          {message}
        </p>
      )}
    </section>
  );
}