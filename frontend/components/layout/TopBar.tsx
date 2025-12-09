"use client";

import { useDashboardContext } from "@/context/DashboardContext";

export default function TopBar() {
  const { windowMinutes, setWindowMinutes } = useDashboardContext();

  const windowOptions: { label: string; minutes: number }[] = [
    { label: "1min", minutes: 1 },
    { label: "5min", minutes: 5 },
    { label: "1h", minutes: 60 },
  ];

  return (
    <header className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-50">Overview</h2>
          <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-300 border border-sky-400/40">
            Realtime
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Real time market data analytics platform
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <span className="text-slate-300">Connected</span>
        </div>

        <div className="hidden items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 sm:flex">
          <span className="text-slate-500">Window</span>
          {windowOptions.map((option) => {
            const isActive = windowMinutes === option.minutes;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setWindowMinutes(option.minutes)}
                className={`rounded-full px-2 py-0.5 text-[10px] transition ${
                  isActive
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
          <span className="h-6 w-6 rounded-full bg-linear-to-tr from-emerald-400 via-sky-400 to-fuchsia-400 text-[11px] font-bold text-slate-950 flex items-center justify-center">
            SZ
          </span>
          <span className="text-slate-300">sean</span>
        </div>
      </div>
    </header>
  );
}