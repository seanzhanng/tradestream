import type {
  WatchlistItem,
  WatchlistChangeColor,
} from "@/lib/dashboardData";

interface WatchlistRowProps extends WatchlistItem {
  isActive: boolean;
  onSelect: () => void;
}

const colorMap: Record<WatchlistChangeColor, string> = {
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  rose: "text-rose-300",
};

export default function WatchlistRow({
  symbol,
  name,
  price,
  change,
  changeColor,
  isActive,
  onSelect,
}: WatchlistRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl px-3 py-2 border text-left text-xs transition
        ${
          isActive
            ? "bg-slate-800 border-emerald-400/70"
            : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/70"
        }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold text-slate-100">
            {symbol}
          </div>
          <div className="text-[10px] text-slate-500">{name}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-100">{price}</div>
          <div className={`text-[10px] ${colorMap[changeColor]}`}>
            {change}
          </div>
        </div>
      </div>
    </button>
  );
}