import { BookOpenCheck, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { register, signIn, type CurrentUser } from "../lib/api";

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: CurrentUser) => void }) {
  const [mode, setMode] = useState<"sign-in" | "register">("register");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null); setPending(true);
    try {
      const result = mode === "register" ? await register({ displayName, email, password }) : await signIn({ email, password });
      onAuthenticated(result.user);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not continue."); }
    finally { setPending(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-[#f7f7f2] px-5 py-10"><section className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_80px_-38px_rgba(15,23,42,.45)] sm:p-9"><div className="grid size-12 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><BookOpenCheck className="size-6" /></div><p className="mt-7 text-sm font-semibold text-emerald-700">Recall</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">{mode === "register" ? "Create your study space." : "Welcome back."}</h1><p className="mt-3 leading-7 text-slate-600">{mode === "register" ? "Start with a private account. Your modules will belong only to you." : "Sign in to continue your study workspace."}</p><form className="mt-7 space-y-4" onSubmit={submit}>{mode === "register" && <label className="block text-sm font-semibold">Name<input className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>}<label className="block text-sm font-semibold">Email<input className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="block text-sm font-semibold">Password<input className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 font-semibold text-white disabled:opacity-60" disabled={pending}>{pending && <LoaderCircle className="size-4 animate-spin" />}{mode === "register" ? "Create account" : "Sign in"}</button></form><button className="mt-5 text-sm font-semibold text-emerald-700" onClick={() => { setMode(mode === "register" ? "sign-in" : "register"); setError(null); }}>{mode === "register" ? "Already have an account? Sign in" : "New here? Create an account"}</button></section></main>;
}
