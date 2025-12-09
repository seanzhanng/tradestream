"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FOCUS_SYMBOL, type WatchlistItem } from "@/lib/dashboardData";
import { getCurrentUserId } from "@/lib/currentUser";

export interface DashboardContextValue {
  focusSymbol: string;
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

export function DashboardProvider({ children }: { children: ReactNode }) {
  // This is your currently focused symbol on the chart.
  // Starts as FOCUS_SYMBOL, but we’ll override it once backend watchlist loads.
  const [focusSymbol, setFocusSymbol] = useState<string>(FOCUS_SYMBOL);

  // Chart window: 1min / 5min / 1h (already hooked up in TopBar).
  const [windowMinutes, setWindowMinutes] = useState<number>(1);

  // 💥 The only source of truth for watchlist now.
  // Starts empty, then gets hydrated from the backend.
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // 🔁 Load watchlist from backend once on mount
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

        // Map backend symbols → WatchlistItem objects
        const nextWatchlist: WatchlistItem[] = data.symbols.map((symbol) => ({
          symbol,
          name: symbol, // you can swap to a metadata service later
          price: "—",
          change: "—",
          changeColor: "sky",
        }));

        if (cancelled) {
          return;
        }

        setWatchlist(nextWatchlist);

        // If backend returned symbols, set focus to the first one
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

  // ✅ Symbols we subscribe to for WS + Redis:
  // - always include the current focusSymbol
  // - plus everything in the watchlist
  const subscribedSymbols = useMemo(
    () =>
      Array.from(
        new Set(
          [focusSymbol, ...watchlist.map((item) => item.symbol)].filter(
            (symbol) => symbol.length > 0
          )
        )
      ),
    [focusSymbol, watchlist]
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
    throw new Error("useDashboardContext must be used within DashboardProvider");
  }
  return ctx;
}