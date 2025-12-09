"use client";

import { useState, type FormEvent } from "react";
import { useDashboardContext } from "@/context/DashboardContext";
import type {
  WatchlistItem,
  WatchlistChangeColor,
} from "@/lib/dashboardData";
import { getCurrentUserId } from "@/lib/currentUser";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const DEFAULT_CHANGE_COLOR: WatchlistChangeColor = "sky";

async function persistWatchlist(nextItems: WatchlistItem[]): Promise<void> {
  const userId = getCurrentUserId();
  const url = `${API_BASE_URL}/api/watchlist/${encodeURIComponent(userId)}`;

  const symbols = nextItems.map((item) => item.symbol);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ symbols }),
  });

  if (!res.ok) {
    throw new Error(`watchlist save failed: ${res.status}`);
  }
}

export default function WatchlistSettings() {
  const { watchlist, setWatchlist } = useDashboardContext();

  const [symbolInput, setSymbolInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const rawSymbol = symbolInput.trim().toUpperCase();
    if (rawSymbol.length === 0) {
      return;
    }

    const exists = watchlist.some(
      (item) => item.symbol.toUpperCase() === rawSymbol
    );
    if (exists) {
      return;
    }

    const newItem: WatchlistItem = {
      symbol: rawSymbol,
      name: nameInput.trim() || rawSymbol,
      price: "—",
      change: "—",
      changeColor: DEFAULT_CHANGE_COLOR,
    };

    const nextWatchlist = [...watchlist, newItem];

    setWatchlist(nextWatchlist);

    try {
      await persistWatchlist(nextWatchlist);
    } catch (err) {
      console.error("[WatchlistSettings] error saving watchlist:", err);
    }

    setSymbolInput("");
    setNameInput("");
  };

  const handleRemove = async (symbol: string) => {
    const nextWatchlist = watchlist.filter(
      (item) => item.symbol !== symbol
    );

    setWatchlist(nextWatchlist);

    try {
      await persistWatchlist(nextWatchlist);
    } catch (err) {
      console.error("[WatchlistSettings] error saving watchlist:", err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Watchlist Settings
          </h2>
          <p className="text-[11px] text-slate-500">
            Add or remove symbols from your live dashboard.
          </p>
        </div>
        <span className="text-[11px] text-slate-500">
          {watchlist.length} symbols
        </span>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs sm:flex-row"
      >
        <div className="flex-1">
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
            Symbol
          </label>
          <input
            value={symbolInput}
            onChange={(event) => setSymbolInput(event.target.value)}
            placeholder="e.g. AAPL"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
            Name (optional)
          </label>
          <input
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="e.g. Apple Inc."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow hover:bg-emerald-400 sm:w-auto"
          >
            Add
          </button>
        </div>
      </form>

      {/* Current watchlist */}
      <div className="space-y-2 text-xs">
        {watchlist.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
          >
            <div>
              <div className="text-[11px] font-semibold text-slate-100">
                {item.symbol}
              </div>
              <div className="text-[10px] text-slate-500">
                {item.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                void handleRemove(item.symbol);
              }}
              className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400 hover:border-rose-500 hover:text-rose-300"
            >
              Remove
            </button>
          </div>
        ))}

        {watchlist.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-700/80 bg-slate-900/50 p-3 text-[11px] text-slate-500">
            Your watchlist is empty. Add symbols above to start streaming
            data.
          </div>
        )}
      </div>
    </div>
  );
}
