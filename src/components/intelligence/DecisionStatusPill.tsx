"use client";

import clsx from "clsx";

export function DecisionStatusPill({ status }: { status?: string | null }) {
  const s = (status || "OPEN").toUpperCase();
  const styles: Record<string, string> = {
    OPEN: "bg-amber-500/20 text-amber-200 border-amber-500/40",
    ACCEPTED: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
    REJECTED: "bg-rose-500/15 text-rose-200 border-rose-500/40",
    DEFERRED: "bg-slate-500/15 text-slate-200 border-slate-500/40",
  };
  const cls = styles[s] || styles.OPEN;
  return (
    <span className={clsx("rounded-full border px-2 py-0.5 text-xs font-semibold", cls)}>
      {s}
    </span>
  );
}
