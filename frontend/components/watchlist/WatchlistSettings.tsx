"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDashboardContext } from "@/context/DashboardContext";
import type {
  WatchlistItem,
  WatchlistChangeColor,
} from "@/lib/dashboardData";
import { getCurrentUserId } from "@/lib/currentUser";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const DEFAULT_CHANGE_COLOR: WatchlistChangeColor = "sky";

interface SymbolSearchResult {
  symbol: string;
  name: string;
}

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

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SymbolSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = searchInput.trim().toUpperCase();

    if (trimmed.length === 0) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);

        const params = new URLSearchParams({
          q: trimmed,
          limit: "10",
        });

        const url = `${API_BASE_URL}/api/symbols/search?${params.toString()}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`search failed: ${res.status}`);
        }

        const data = (await res.json()) as SymbolSearchResult[];

        if (!Array.isArray(data)) {
          console.error("[WatchlistSettings] Unexpected search response:", data);
          throw new Error("Unexpected search response shape");
        }

        if (!cancelled) {
          setSearchResults(data);
        }
      } catch (err) {
        console.error("[WatchlistSettings] symbol search error:", err);
        if (!cancelled) {
          setSearchError("Error searching symbols");
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const handleAddFromSearch = async (result: SymbolSearchResult) => {
    const exists = watchlist.some(
      (item) => item.symbol.toUpperCase() === result.symbol.toUpperCase()
    );
    if (exists) {
      return;
    }

    const newItem: WatchlistItem = {
      symbol: result.symbol,
      name: result.name,
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

    setSearchInput("");
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

  const handleManualAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = searchInput.trim().toUpperCase();
    if (raw.length === 0) return;

    const fromResults = searchResults.find(
      (result) => result.symbol.toUpperCase() === raw
    );
    if (fromResults) {
      await handleAddFromSearch(fromResults);
      return;
    }

    const exists = watchlist.some(
      (item) => item.symbol.toUpperCase() === raw
    );
    if (exists) return;

    const newItem: WatchlistItem = {
      symbol: raw,
      name: raw,
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

    setSearchInput("");
  };

  const hasQuery = searchInput.trim().length > 0;

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Watchlist Settings
          </h2>
          <p className="text-[11px] text-slate-500">
            Search and add symbols backed by the shared symbol list.
          </p>
        </div>
        <span className="text-[11px] text-slate-500">
          {watchlist.length} symbols
        </span>
      </div>

      {/* Search box (also supports Enter = manual add) */}
      <form onSubmit={handleManualAdd} className="mb-4">
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
          Search symbol
        </label>
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Type to search (e.g. AAPL, TSLA)"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-[12px] text-slate-100 outline-none focus:border-sky-500"
        />
      </form>

      {/* 🔍 Search results – ONLY when there is a query */}
      {hasQuery && (
        <div className="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
          {isSearching && (
            <div className="text-[11px] text-slate-500">
              Searching…
            </div>
          )}

          {searchError && (
            <div className="text-[11px] text-rose-400">
              {searchError}
            </div>
          )}

          {!isSearching &&
            !searchError &&
            searchInput.trim().length > 0 &&
            searchResults.length === 0 && (
              <div className="text-[11px] text-slate-500">
                No symbols found for {searchInput.trim().toUpperCase()}.
              </div>
            )}

          {searchResults.map((result) => {
            const inWatchlist = watchlist.some(
              (item) =>
                item.symbol.toUpperCase() === result.symbol.toUpperCase()
            );

            return (
              <div
                key={result.symbol}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2"
              >
                <div>
                  <div className="text-[11px] font-semibold text-slate-100">
                    {result.symbol}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {result.name}
                  </div>
                </div>
                {inWatchlist ? (
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-[10px] text-slate-400">
                    In watchlist
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void handleAddFromSearch(result);
                    }}
                    className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

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
            Your watchlist is empty. Search above to add symbols.
          </div>
        )}
      </div>
    </div>
  );
}