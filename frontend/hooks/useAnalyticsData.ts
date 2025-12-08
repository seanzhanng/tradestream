"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboardContext } from "@/context/DashboardContext";

export interface AnalyticsSnapshot {
  symbol: string;
  vwap: number;
  volatility: number;
  pctChange: number;
  avgVolume: number;
  volumeSpike: boolean;
  timestamp?: number;
}

interface AnalyticsState {
  analyticsBySymbol: Record<string, AnalyticsSnapshot>;
}

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export default function useAnalyticsData() {
  const { subscribedSymbols, focusSymbol } = useDashboardContext();

  const [state, setState] = useState<AnalyticsState>({
    analyticsBySymbol: {},
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSymbols = subscribedSymbols.length > 0;
  const symbolsKey = subscribedSymbols.join(",");

  useEffect(() => {
    if (!hasSymbols) {
      return;
    }

    let isActive = true;

    const wsUrl = `${WS_BASE_URL}/ws/analytics?symbols=${encodeURIComponent(
      symbolsKey
    )}`;

    function connect() {
      if (!isActive) {
        return;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isActive) {
          return;
        }
        console.log("🧮 Analytics WS connected:", wsUrl);
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        if (!isActive) {
          return;
        }

        try {
          const raw = JSON.parse(event.data) as {
            avg_volume: number;
            pct_change: number;
            symbol: string;
            timestamp: number;
            volatility: number;
            volume_spike: boolean;
            vwap: number;
          };

          const snapshot: AnalyticsSnapshot = {
            symbol: raw.symbol,
            vwap: raw.vwap,
            volatility: raw.volatility,
            pctChange: raw.pct_change,
            avgVolume: raw.avg_volume,
            volumeSpike: raw.volume_spike,
            timestamp: raw.timestamp,
          };

          setState((prev) => ({
            analyticsBySymbol: {
              ...prev.analyticsBySymbol,
              [snapshot.symbol]: snapshot,
            },
          }));
        } catch (err) {
          console.error("Analytics WS parse error:", err);
        }
      };

      ws.onerror = (event: Event) => {
        if (!isActive) {
          return;
        }
        console.error("⚠️ Analytics WS error:", event);
      };

      ws.onclose = () => {
        if (!isActive) {
          return;
        }
        console.log("🔴 Analytics WS closed, retrying in 1500ms…");
        reconnectRef.current = setTimeout(connect, 1500);
      };
    }

    connect();

    return () => {
      isActive = false;

      if (reconnectRef.current !== null) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      if (wsRef.current !== null) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [hasSymbols, symbolsKey]);

  const analyticsForFocus = state.analyticsBySymbol[focusSymbol];

  return {
    analyticsBySymbol: state.analyticsBySymbol,
    analyticsForFocus,
  };
}