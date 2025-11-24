// src/components/ai-people-timeline.tsx
"use client";

import { useEffect, useState } from "react";

type AiPeopleTimelineProps = {
  employeeId: string;
};

type AiPersonInsights = {
  summary: string;
  strengths?: string[];
  risks?: string[];
  nextActions?: string[];
};

const FALLBACK_INSIGHTS: AiPersonInsights = {
  summary:
    "Katherine owns People & Talent for a lean, early-stage org. Current workload is manageable, but hiring will quickly become a bottleneck as headcount grows.",
  strengths: [
    "Clear ownership of People, Talent, and HR operations",
    "Central point of contact for recruiting and onboarding",
    "Early signal tracking across org health, even with small team",
  ],
  risks: [
    "People operations heavily concentrated in a single person",
    "Hiring process and documentation still forming",
    "Limited buffer for PTO or unexpected time away",
  ],
  nextActions: [
    "Create a lightweight hiring playbook to reduce dependency on Katherine.",
    "Define a simple approval workflow for headcount and offers.",
    "Set up recurring reviews of pipeline, performance, and burnout risk.",
  ],
};

export default function AiPeopleTimeline({ employeeId }: AiPeopleTimelineProps) {
  const [data, setData] = useState<AiPersonInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch("/api/ai-insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scope: "person",
            employeeId,
          }),
        });

        if (!res.ok) {
          throw new Error(`AI endpoint failed with ${res.status}`);
        }

        const json = await res.json();

        // Try to map a flexible response into our shape.
        const mapped: AiPersonInsights = {
          summary:
            json.summary ||
            json.overview ||
            FALLBACK_INSIGHTS.summary,
          strengths:
            json.strengths ||
            json.positives ||
            FALLBACK_INSIGHTS.strengths,
          risks:
            json.risks ||
            json.watchouts ||
            FALLBACK_INSIGHTS.risks,
          nextActions:
            json.nextActions ||
            json.recommendations ||
            FALLBACK_INSIGHTS.nextActions,
        };

        if (!cancelled) {
          setData(mapped);
        }
      } catch (err) {
        console.error("AI People insights failed, using fallback", err);
        if (!cancelled) {
          setData(FALLBACK_INSIGHTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const insights = data ?? FALLBACK_INSIGHTS;

  return (
    <div className="space-y-4 text-sm text-slate-700">
      {/* Top line summary */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          AI summary
        </h3>
        <p className="mt-1 leading-snug text-slate-700">
          {loading ? "Analyzing this person’s activity and role context…" : insights.summary}
        </p>
      </div>

      {/* Three-column insight grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Strengths */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Strengths
          </div>
          <ul className="mt-2 space-y-1.5 text-xs text-emerald-900">
            {(insights.strengths ?? []).map((item, idx) => (
              <li key={idx} className="flex gap-1.5">
                <span className="mt-[2px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks / watchouts */}
        <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Watchouts
          </div>
          <ul className="mt-2 space-y-1.5 text-xs text-amber-900">
            {(insights.risks ?? []).map((item, idx) => (
              <li key={idx} className="flex gap-1.5">
                <span className="mt-[2px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested next actions */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
            Suggested actions
          </div>
          <ul className="mt-2 space-y-1.5 text-xs text-indigo-900">
            {(insights.nextActions ?? []).map((item, idx) => (
              <li key={idx} className="flex gap-1.5">
                <span className="mt-[2px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="pt-1 text-[11px] text-slate-400">
        Generated from recent timeline events and this person’s role context. Not a performance
        review; use as directional input.
      </p>
    </div>
  );
}
