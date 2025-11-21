// src/components/ai-people-timeline.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  employeeId: string;
};

type Insight = {
  title: string;
  summary: string;
};

export default function AiPeopleTimeline({ employeeId }: Props) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        // Uses the same /api/ai-insights route you already have for AiInsightsCard
        const res = await fetch("/api/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope: "person",
            employeeId,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json().catch(() => null);

        if (!cancelled) {
          setInsight({
            title: data?.title ?? "AI summary",
            summary:
              data?.summary ??
              data?.text ??
              "AI summary generated from recent activity and role context.",
          });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(
            "AI summary is not available right now. Check the AI config or try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  if (loading) {
    return (
      <div className="space-y-2 text-xs">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-5/6 rounded bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-rose-600">{error}</p>;
  }

  if (!insight) {
    return (
      <p className="text-xs text-slate-500">
        No AI insights yet for this person.
      </p>
    );
  }

  return (
    <div className="space-y-2 text-xs">
      <h3 className="text-sm font-semibold text-slate-900">
        {insight.title}
      </h3>
      <p className="text-slate-700 whitespace-pre-wrap">
        {insight.summary}
      </p>
      <p className="text-[10px] text-slate-400">
        Generated from recent events and role context.
      </p>
    </div>
  );
}
