"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { FOCUS_SYMBOL, WATCHLIST_ITEMS } from "@/lib/dashboardData";

export interface DashboardContextValue {
  focusSymbol: string;
  subscribedSymbols: string[];
  setFocusSymbol: (symbol: string) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [focusSymbol, setFocusSymbol] = useState<string>(FOCUS_SYMBOL);

  // All symbols we care about (static): focus default + watchlist
  const subscribedSymbols = useMemo(
    () =>
      Array.from(
        new Set([FOCUS_SYMBOL, ...WATCHLIST_ITEMS.map((item) => item.symbol)])
      ),
    []
  );

  const value = useMemo(
    () => ({
      focusSymbol,
      subscribedSymbols,
      setFocusSymbol,
    }),
    [focusSymbol, subscribedSymbols]
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