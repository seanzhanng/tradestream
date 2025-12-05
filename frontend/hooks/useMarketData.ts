"use client";

import { useEffect, useRef, useState } from "react";
import type { StreamEvent } from "@/lib/dashboardData";
import { MAX_STREAM_EVENTS, MAX_TICK_HISTORY } from "@/lib/dashboardData";

export interface TickEvent {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number; // seconds since epoch
}

interface MarketDataState {
  ticksBySymbol: Record<string, TickEvent>;
  tickHistoryBySymbol: Record<string, TickEvent[]>;
  streamEvents: StreamEvent[];
}

interface RedisTickResponse {
  symbol?: string;
  price: number;
  volume: number;
  timestamp_ms?: number;
  timestamp?: number;
}

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function useMarketData(symbols: string[], focusSymbol: string) {
  const [state, setState] = useState<MarketDataState>({
    ticksBySymbol: {},
    tickHistoryBySymbol: {},
    streamEvents: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSymbols = symbols.length > 0;
  const symbolsKey = symbols.join(",");

  // 🔥 STEP 1 — Fetch initial tick history from Redis for ALL symbols
  useEffect(() => {
    if (!hasSymbols) return;

    let cancelled = false;

    async function loadHistory() {
      try {
        const historyBySymbol: Record<string, TickEvent[]> = {};

        await Promise.all(
          symbols.map(async (symbol) => {
            const url = `${API_BASE_URL}/api/ticks?symbol=${encodeURIComponent(
              symbol
            )}&lookback_hours=24`;

            try {
              const res = await fetch(url);
              if (!res.ok) {
                console.warn(
                  `[useMarketData] history fetch failed for ${symbol}: ${res.status}`
                );
                return;
              }

              const raw: RedisTickResponse[] = await res.json();

              const mapped: TickEvent[] = raw
                .map((t) => {
                  const tsMs =
                    typeof t.timestamp_ms === "number"
                      ? t.timestamp_ms
                      : t.timestamp != null
                      ? t.timestamp * 1000
                      : null;

                  if (tsMs == null) return null;

                  return {
                    symbol: t.symbol ?? symbol,
                    price: t.price,
                    volume: t.volume,
                    timestamp: tsMs / 1000,
                  };
                })
                .filter((t): t is TickEvent => t !== null);

              historyBySymbol[symbol] = mapped.slice(-MAX_TICK_HISTORY);
            } catch (err) {
              console.error(
                `[useMarketData] error fetching history for ${symbol}:`,
                err
              );
            }
          })
        );

        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          tickHistoryBySymbol: {
            ...prev.tickHistoryBySymbol,
            ...historyBySymbol,
          },
        }));
      } catch (err) {
        console.error("[useMarketData] error loading Redis history:", err);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [symbols, symbolsKey, hasSymbols]);

  // 🔥 STEP 2 — Live WebSocket streaming
  useEffect(() => {
    if (!hasSymbols) return;

    const wsUrl = `${WS_BASE_URL}/ws/ticks?symbols=${encodeURIComponent(
      symbolsKey
    )}`;

    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🟢 Ticks WS connected:", wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data) as {
            symbol: string;
            price: number;
            volume: number;
            timestamp: number; // seconds
          };

          const tick: TickEvent = {
            symbol: raw.symbol,
            price: raw.price,
            volume: raw.volume,
            timestamp: raw.timestamp,
          };

          setState((prev) => {
            const nextTicks = {
              ...prev.ticksBySymbol,
              [tick.symbol]: tick,
            };

            const prevHistory = prev.tickHistoryBySymbol[tick.symbol] ?? [];
            const nextHistory = [...prevHistory, tick].slice(-MAX_TICK_HISTORY);

            const nextHistoryBySymbol = {
              ...prev.tickHistoryBySymbol,
              [tick.symbol]: nextHistory,
            };

            const timeStr = new Date(
              tick.timestamp * 1000
            ).toLocaleTimeString();

            const newEvent: StreamEvent = {
              id: `${tick.symbol}-${tick.timestamp}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              type: "tick",
              text: `[${timeStr}] ${tick.symbol} • $${tick.price.toFixed(
                2
              )} @ ${tick.volume}`,
              symbol: tick.symbol,
            };

            return {
              ticksBySymbol: nextTicks,
              tickHistoryBySymbol: nextHistoryBySymbol,
              streamEvents: [
                newEvent,
                ...prev.streamEvents,
              ].slice(0, MAX_STREAM_EVENTS),
            };
          });
        } catch (err) {
          console.error("[useMarketData] WS parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[useMarketData] WS error:", err);
        ws.close();
      };

      ws.onclose = () => {
        console.log("🔴 Ticks WS closed, retrying in 1500ms…");
        reconnectRef.current = setTimeout(connect, 1500);
      };
    }

    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [symbolsKey, hasSymbols]);

  const lastTickForFocus = state.ticksBySymbol[focusSymbol];
  const historyForFocus = state.tickHistoryBySymbol[focusSymbol] ?? [];

  return {
    ticksBySymbol: state.ticksBySymbol,
    tickHistoryBySymbol: state.tickHistoryBySymbol,
    streamEvents: state.streamEvents,
    lastTickForFocus,
    historyForFocus,
  };
}