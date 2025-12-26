import { ArrowDown, ArrowUp, Minus } from "lucide-react";

type Props = {
  confidence?: number | null;
  delta?: number | null;
  className?: string;
};

export function ConfidencePill({ confidence, delta, className }: Props) {
  const val = confidence != null ? Math.round(confidence) : null;
  let tone = "bg-slate-100 text-slate-800";
  if (val != null) {
    if (val >= 80) tone = "bg-emerald-100 text-emerald-800";
    else if (val >= 50) tone = "bg-amber-100 text-amber-800";
    else tone = "bg-rose-100 text-rose-800";
  }
  const arrow = delta == null ? null : delta > 0 ? <ArrowUp className="h-3 w-3" /> : delta < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${tone} ${className ?? ""}`}>
      {arrow}
      {val != null ? `${val}%` : "—"}
    </span>
  );
}
