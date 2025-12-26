"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

type OrgSummary = {
  summaryText: string;
  bullets: string[];
  riskLevel: RiskLevel;
};

export function OrgSummaryCard() {
  const [data, setData] = useState<OrgSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<OrgSummary>("/ai/org-summary");
        if (!cancelled) setData(res ?? null);
      } catch (err) {
        console.error("Failed to load AI org summary", err);
        if (!cancelled) {
          setError("AI summary is temporarily unavailable.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const riskBadge = (risk: RiskLevel) => {
    if (risk === "HIGH") {
      return (
        <Badge className="rounded-full bg-red-50 text-red-700 border-red-200 text-[10px]">
          High risk
        </Badge>
      );
    }
    if (risk === "MEDIUM") {
      return (
        <Badge className="rounded-full bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
          Medium risk
        </Badge>
      );
    }
    return (
      <Badge className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
        Stable
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="h-full border-slate-200 bg-white/70 p-4 shadow-sm">
        <div className="mb-2 h-3 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mb-1 h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="mb-1 h-3 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 space-y-1">
          <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-dashed border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500">
        <div className="mb-1 font-medium text-slate-700">AI org summary</div>
        <p>{error ?? "Connect Intime data to unlock AI org insights."}</p>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white/80 p-4 text-xs shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI org summary
          </div>
          <p className="text-[11px] text-slate-400">
            A quick pulse across people, time off, and hiring.
          </p>
        </div>
        {riskBadge(data.riskLevel)}
      </div>
      <p className="mb-3 text-sm text-slate-900">{data.summaryText}</p>
      {data.bullets.length > 0 && (
        <ul className="space-y-1">
          {data.bullets.slice(0, 4).map((b, idx) => (
            <li key={idx} className="flex gap-2 text-[11px] text-slate-600">
              <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
