export const DASHBOARD_NAV_ITEMS = ["Dashboard", "Watchlist", "Settings"] as const;

export const MAX_STREAM_EVENTS = 500;
export const MAX_TICK_HISTORY = 120;

export type MetricAccent = "emerald" | "sky" | "amber" | "fuchsia";

export interface MetricDefinition {
  label: string;
  value: string;
  accent: MetricAccent;
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  { label: "VWAP", value: "—", accent: "emerald" },
  { label: "Spread", value: "—", accent: "sky" },
  { label: "Volatility (5m)", value: "—", accent: "amber" },
  { label: "Last Tick", value: "—", accent: "fuchsia" },
];

export type StreamEventType = "tick" | "analytics";

export interface StreamEvent {
  id: string;
  type: StreamEventType;
  text: string;
  symbol?: string;
}

export type WatchlistChangeColor = "emerald" | "sky" | "rose";

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changeColor: WatchlistChangeColor;
}