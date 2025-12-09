// frontend/context/DashboardContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WatchlistItem } from "@/lib/dashboardData";
import { getCurrentUserId } from "@/lib/currentUser";

export interface DashboardContextValue {
  focusSymbol: string;                // "" means "no focus selected"
  subscribedSymbols: string[];
  setFocusSymbol: (symbol: string) => void;
  windowMinutes: number;
  setWindowMinutes: (minutes: number) => void;

  watchlist: WatchlistItem[];
  setWatchlist: (items: WatchlistItem[]) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface WatchlistApiResponse {
  user_id: string;
  symbols: string[];
}

interface SymbolSearchResult {
  symbol: string;
  name: string;
}

async function resolveNameForSymbol(symbol: string): Promise<string> {
  const trimmed = symbol.trim().toUpperCase();
  if (trimmed.length === 0) {
    return symbol;
  }

  try {
    const params = new URLSearchParams({
      q: trimmed,
      limit: "1",
    });

    const url = `${API_BASE_URL}/api/symbols/search?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(
        "[DashboardContext] symbol lookup failed for",
        symbol,
        "status:",
        res.status
      );
      return symbol;
    }

    const data = (await res.json()) as SymbolSearchResult[];

    if (!Array.isArray(data) || data.length === 0) {
      return symbol;
    }

    const exact =
      data.find(
        (entry) => entry.symbol.toUpperCase() === trimmed
      ) ?? data[0];

    return exact.name || symbol;
  } catch (err) {
    console.error("[DashboardContext] resolveNameForSymbol error:", err);
    return symbol;
  }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  // 👉 "" means "no focus symbol yet"
  const [focusSymbol, setFocusSymbol] = useState<string>("");

  // Chart window: 1min / 5min / 1h
  const [windowMinutes, setWindowMinutes] = useState<number>(1);

  // Source of truth for the watchlist, hydrated from backend
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load watchlist from backend once on mount
  useEffect(() => {
    let cancelled = false;

    async function loadWatchlist() {
      try {
        const userId = getCurrentUserId();
        const url = `${API_BASE_URL}/api/watchlist/${encodeURIComponent(
          userId
        )}`;

        const res = await fetch(url);

        if (res.status === 404) {
          // user exists but has no watchlist yet: leave empty
          return;
        }

        if (!res.ok) {
          throw new Error(`watchlist fetch failed: ${res.status}`);
        }

        const data = (await res.json()) as WatchlistApiResponse;

        const nextWatchlist: WatchlistItem[] = await Promise.all(
          data.symbols.map(async (symbol) => {
            const name = await resolveNameForSymbol(symbol);
            return {
              symbol,
              name,
              price: "—",
              change: "—",
              changeColor: "sky",
            };
          })
        );

        if (cancelled) {
          return;
        }

        setWatchlist(nextWatchlist);

        // If backend returned symbols, set focus to the first;
        // otherwise keep "" (no focus).
        if (nextWatchlist.length > 0) {
          setFocusSymbol(nextWatchlist[0].symbol);
        }
      } catch (err) {
        console.error("[DashboardContext] loadWatchlist error:", err);
      }
    }

    void loadWatchlist();

    return () => {
      cancelled = true;
    };
  }, []);

  // Symbols we subscribe to:
  // just the watchlist symbols (we drop "" automatically)
  const subscribedSymbols = useMemo(
    () =>
      Array.from(
        new Set(
          watchlist
            .map((item) => item.symbol)
            .filter((symbol) => symbol.length > 0)
        )
      ),
    [watchlist]
  );

  const value: DashboardContextValue = useMemo(
    () => ({
      focusSymbol,
      subscribedSymbols,
      setFocusSymbol,
      windowMinutes,
      setWindowMinutes,
      watchlist,
      setWatchlist,
    }),
    [focusSymbol, subscribedSymbols, windowMinutes, watchlist]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (ctx == null) {
    throw new Error(
      "useDashboardContext must be used within DashboardProvider"
    );
  }
  return ctx;
}