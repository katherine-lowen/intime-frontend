// src/components/ai-insights-card.tsx
"use client";

import { useEffect, useState } from "react";

type AiInsights = {
  summary: string;
  suggestions: string[];
};

export default function AiInsightsCard() {
  const [data, setData] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creatingIndex, setCreatingIndex] = useState<number | null>(null);
  const [createdIndex, setCreatedIndex] = useState<number | null>(null);

 async function fetchInsights() {
  try {
    setLoading(true);
    setError(null);


      const res = await fetch("/api/ai-insights", {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const json = (await res.json()) as AiInsights;
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(suggestion: string, index: number) {
    try {
      setCreatingIndex(index);
      setError(null);

      const res = await fetch("/api/ai-suggestion-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      await res.json().catch(() => ({}));
      setCreatedIndex(index);

      // Clear the "Added" state after a short delay
      setTimeout(() => {
        setCreatedIndex((prev) => (prev === index ? null : prev));
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to create event from suggestion");
    } finally {
      setCreatingIndex(null);
    }
  }

  useEffect(() => {
    // Load once on mount
    fetchInsights();
  }, []);

  return (
    <section className="rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-neutral-900/60">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
            AI Org Time Insights
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Quick snapshot of what&apos;s happening across your org.
          </p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {loading && !data && (
        <div className="space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-3 space-y-1">
            <div className="h-2 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-2 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      )}

      {error && (
        <p className="mb-2 text-xs text-red-500">
          Couldn&apos;t load AI insights: {error}
        </p>
      )}

      {data && !loading && (
        <div className="space-y-3">
          {data.summary && (
            <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-100">
              {data.summary}
            </p>
          )}

          {Array.isArray(data.suggestions) && data.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Suggested next actions
              </p>
              <ul className="space-y-1.5 text-sm text-neutral-800 dark:text-neutral-100">
                {data.suggestions.map((s, idx) => {
                  const isCreating = creatingIndex === idx;
                  const isCreated = createdIndex === idx;

                  return (
                    <li
                      key={idx}
                      className="flex items-start justify-between gap-2 rounded-lg bg-neutral-50 px-2 py-1.5 text-xs leading-snug dark:bg-neutral-800/70"
                    >
                      <div className="flex gap-2">
                        <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                        <span>{s}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCreateEvent(s, idx)}
                        disabled={isCreating || isCreated}
                        className="ml-2 shrink-0 rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-700"
                      >
                        {isCreating
                          ? "Adding…"
                          : isCreated
                          ? "Added ✓"
                          : "Add as event"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
