"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { FOCUS_SYMBOL, WATCHLIST_ITEMS } from "@/lib/dashboardData";

export interface DashboardContextValue {
  focusSymbol: string;
  subscribedSymbols: string[];
  setFocusSymbol: (symbol: string) => void;
  windowMinutes: number;
  setWindowMinutes: (minutes: number) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [focusSymbol, setFocusSymbol] = useState<string>(FOCUS_SYMBOL);
  const [windowMinutes, setWindowMinutes] = useState<number>(1);

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
      windowMinutes,
      setWindowMinutes,
    }),
    [focusSymbol, subscribedSymbols, windowMinutes]
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