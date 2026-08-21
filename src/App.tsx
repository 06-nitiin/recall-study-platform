import { Activity, ArrowUpRight, CheckCircle2, Server } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { getHealthStatus } from "./lib/api";

type ApiState = "checking" | "ready" | "unavailable";

export default function App() {
  const [apiState, setApiState] = useState<ApiState>("checking");
  useEffect(() => { getHealthStatus().then(() => setApiState("ready")).catch(() => setApiState("unavailable")); }, []);
  const statusCopy = apiState === "ready" ? "Local API connected" : apiState === "unavailable" ? "Start pnpm dev to connect the API" : "Checking local API";

  return (
    <div className="min-h-screen bg-[#f7f7f2] text-slate-950 lg:flex">
      <Sidebar />
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold text-emerald-700">Standalone project</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Your study workspace.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">A local-first foundation for adaptive learning, active recall, and deliberately paced study features.</p></div><div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"><Server className="size-4 text-emerald-700" />{statusCopy}</div></header>
        <section className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]"><article className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-7 sm:p-9"><div className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-800"><CheckCircle2 className="size-5" /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">Foundation complete</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Ready for your first feature.</h2><p className="mt-3 max-w-xl leading-7 text-slate-600">This project now has a normal package manifest, a React client, an Express API, local SQLite configuration, a schema, environment examples, and test scripts. The next commit will add real user authentication and modules.</p></article><article className="rounded-[1.75rem] bg-slate-950 p-7 text-white sm:p-9"><Activity className="size-5 text-emerald-400" /><p className="mt-8 text-sm font-medium text-slate-400">Build sequence</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">One meaningful commit at a time.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Every future milestone will add one working capability to this repository, with validation commands and Git guidance.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">View project structure <ArrowUpRight className="size-4" /></span></article></section>
      </main>
    </div>
  );
}
