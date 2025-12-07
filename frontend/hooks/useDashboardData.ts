"use client";

import { useEffect, useMemo, useState } from "react";
import {
  METRIC_DEFINITIONS,
  WATCHLIST_ITEMS,
} from "@/lib/dashboardData";
import type {
  WatchlistItem,
  WatchlistChangeColor,
  StreamEvent,
} from "@/lib/dashboardData";
import useMarketData, { TickEvent } from "@/hooks/useMarketData";
import useAnalyticsData from "@/hooks/useAnalyticsData";
import { useDashboardContext } from "@/context/DashboardContext";

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface PriceSummary {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  pctChange?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function useDashboardData() {
  const {
    focusSymbol,
    subscribedSymbols,
    setFocusSymbol,
    windowMinutes,
  } = useDashboardContext();

  const {
    streamEvents: rawStreamEvents,
    lastTickForFocus,
    historyForFocus,
    ticksBySymbol,
    tickHistoryBySymbol,
  } = useMarketData();

  const { analyticsForFocus } = useAnalyticsData();

  const [dailyBaselines, setDailyBaselines] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const symbolsParam = subscribedSymbols.join(",");
    const url = `${API_BASE_URL}/api/baselines?symbols=${encodeURIComponent(
      symbolsParam
    )}`;

    let cancelled = false;

    async function fetchBaselines() {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`baseline fetch failed: ${res.status}`);
        }
        const data = (await res.json()) as Record<string, number>;
        if (!cancelled) {
          setDailyBaselines(data);
        }
      } catch (err) {
        console.error("[baselines] error:", err);
        if (!cancelled) {
          setDailyBaselines({});
        }
      }
    }

    fetchBaselines();

    return () => {
      cancelled = true;
    };
  }, [subscribedSymbols]);

  const priceSeries: PricePoint[] = useMemo(() => {
    const history = historyForFocus as TickEvent[];
    if (history.length === 0) {
      return [];
    }

    const nowSeconds = Date.now() / 1000;
    const cutoff = nowSeconds - windowMinutes * 60;

    const filtered = history.filter((tick) => tick.timestamp >= cutoff);

    return filtered.map((tick) => ({
      timestamp: tick.timestamp,
      price: tick.price,
    }));
  }, [historyForFocus, windowMinutes]);

  const priceSummary: PriceSummary = useMemo(() => {
    if (priceSeries.length === 0) {
      return {};
    }

    const open = priceSeries[0].price;
    const close = priceSeries[priceSeries.length - 1].price;

    let high = open;
    let low = open;

    for (const point of priceSeries) {
      if (point.price > high) high = point.price;
      if (point.price < low) low = point.price;
    }

    const pctChange =
      open !== 0 ? ((close - open) / open) * 100 : undefined;

    return { open, high, low, close, pctChange };
  }, [priceSeries]);

  const metrics = useMemo(
    () =>
      METRIC_DEFINITIONS.map((metric) => {
        if (metric.label === "Last Tick" && lastTickForFocus) {
          return {
            ...metric,
            value: `$${lastTickForFocus.price.toFixed(
              2
            )} • ${lastTickForFocus.volume}`,
          };
        }

        if (!analyticsForFocus) {
          return metric;
        }

        if (metric.label === "VWAP") {
          return {
            ...metric,
            value: `$${analyticsForFocus.vwap.toFixed(2)}`,
          };
        }

        if (metric.label === "Spread") {
          const pct = analyticsForFocus.pctChange * 100;
          const sign = pct >= 0 ? "+" : "";
          return {
            ...metric,
            value: `${sign}${pct.toFixed(2)}%`,
          };
        }

        if (metric.label.startsWith("Volatility")) {
          return {
            ...metric,
            value: `${analyticsForFocus.volatility.toFixed(2)}%`,
          };
        }

        return metric;
      }),
    [lastTickForFocus, analyticsForFocus]
  );

  const streamEvents: StreamEvent[] = useMemo(
    () =>
      rawStreamEvents.filter(
        (event) =>
          event.symbol == null || event.symbol === focusSymbol
      ),
    [rawStreamEvents, focusSymbol]
  );

  const watchlistItems: WatchlistItem[] = useMemo(
    () =>
      WATCHLIST_ITEMS.map((item) => {
        const liveTick = ticksBySymbol[item.symbol];

        if (!liveTick) {
          return item;
        }

        const historyForSymbol =
          (tickHistoryBySymbol[item.symbol] as TickEvent[]) ?? [];

        const baselineFromDb = dailyBaselines[item.symbol];

        const baseline =
          baselineFromDb ??
          historyForSymbol[0]?.price ??
          liveTick.price;

        const currentPrice = liveTick.price;
        const priceStr = currentPrice.toFixed(2);

        let changeStr = item.change;
        let changeColor: WatchlistChangeColor = item.changeColor;

        if (baseline > 0) {
          const pctChange = ((currentPrice - baseline) / baseline) * 100;
          const sign = pctChange >= 0 ? "+" : "";
          changeStr = `${sign}${pctChange.toFixed(2)}%`;

          if (pctChange > 0.001) changeColor = "emerald";
          else if (pctChange < -0.001) changeColor = "rose";
          else changeColor = "sky";
        }

        return {
          ...item,
          price: priceStr,
          change: changeStr,
          changeColor,
        };
      }),
    [ticksBySymbol, tickHistoryBySymbol, dailyBaselines]
  );

  return {
    focusSymbol,
    setFocusSymbol,
    subscribedSymbols,
    metrics,
    streamEvents,
    priceSeries,
    priceSummary,
    lastTickForFocus,
    analyticsForFocus,
    watchlistItems,
  };
}