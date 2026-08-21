import { useEffect, useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { ModuleDashboard } from "./components/ModuleDashboard";
import { getCurrentUser, type CurrentUser } from "./lib/api";

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => { getCurrentUser().then((result) => setUser(result.user)).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);
  if (checking) return <main className="grid min-h-screen place-items-center bg-[#f7f7f2] text-slate-600">Opening your study space…</main>;
  return user ? <ModuleDashboard user={user} onSignedOut={() => setUser(null)} /> : <AuthScreen onAuthenticated={setUser} />;
}
