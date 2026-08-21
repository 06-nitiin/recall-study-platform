import { BarChart3, BookOpenCheck, BrainCircuit, GraduationCap, Settings2 } from "lucide-react";

const navigation = [
  { label: "Today", icon: BrainCircuit, active: true },
  { label: "Modules", icon: BookOpenCheck, active: false },
  { label: "Progress", icon: BarChart3, active: false },
  { label: "Settings", icon: Settings2, active: false },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 p-4 text-slate-100 lg:flex">
      <div className="flex items-center gap-3 px-2 py-3"><div className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950"><GraduationCap className="size-5" /></div><span className="text-base font-semibold tracking-tight">Recall</span></div>
      <p className="mt-10 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
      <nav className="mt-3 space-y-1">{navigation.map(({ label, icon: Icon, active }) => <button key={label} type="button" className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${active ? "bg-emerald-400 text-slate-950" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}><Icon className="size-4" />{label}</button>)}</nav>
      <div className="mt-auto rounded-2xl bg-slate-900 p-4"><p className="text-sm font-semibold">Standalone foundation</p><p className="mt-1 text-xs leading-5 text-slate-400">Your local React, API, database, and test setup is ready for the next feature commit.</p></div>
    </aside>
  );
}
