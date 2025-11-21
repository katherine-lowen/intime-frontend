// src/app/jobs/[id]/job-insights-client.tsx
"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";

type Props = {
  jobId: string;
  title: string;
  department?: string | null;
  status: string;
  daysOpen: number | null;
  applicantsCount: number;
};

type AiInsightsResponse = {
  insights?: string;
  summary?: string;
  message?: string;
  text?: string;
  [key: string]: unknown;
};

export default function JobInsightsClient({
  jobId,
  title,
  department,
  status,
  daysOpen,
  applicantsCount,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchInsights() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai-insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scope: "job",
            jobId,
            title,
            department,
            status,
            daysOpen,
            applicantsCount,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: AiInsightsResponse = await res.json();
        if (cancelled) return;

        const text =
          data.insights ||
          data.summary ||
          data.message ||
          data.text ||
          JSON.stringify(data, null, 2);

        setContent(text);
      } catch (err) {
        console.error("AI job insights error", err);
        if (!cancelled) setError("Unable to load AI suggestions right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchInsights();
    return () => {
      cancelled = true;
    };
  }, [jobId, title, department, status, daysOpen, applicantsCount]);

  // Fallback heuristics if AI fails
  const fallback = (
    <ul className="mt-2 space-y-2 text-sm">
      {status === "OPEN" && daysOpen != null && daysOpen > 30 && (
        <li className="rounded bg-gray-50 px-3 py-2">
          <div className="text-xs font-medium text-gray-700">
            Role has been open for a while
          </div>
          <div className="text-xs text-gray-600">
            This role has been open for over {daysOpen} days. Consider refreshing
            the JD, widening sourcing, or revisiting compensation and level.
          </div>
        </li>
      )}

      {status === "OPEN" && applicantsCount === 0 && (
        <li className="rounded bg-gray-50 px-3 py-2">
          <div className="text-xs font-medium text-gray-700">
            No applicants yet
          </div>
          <div className="text-xs text-gray-600">
            There are no applicants in the pipeline. Make sure the role is live
            on your careers page and pushed to your key channels.
          </div>
        </li>
      )}

      <li className="rounded bg-gray-50 px-3 py-2">
        <div className="text-xs font-medium text-gray-700">
          Keep the hiring log clean
        </div>
        <div className="text-xs text-gray-600">
          Log interviews, onsite loops, offers, and final decisions so you always
          have a clear story of how this role was filled.
        </div>
      </li>
    </ul>
  );

  return (
    <section className="rounded border bg-white p-4 text-sm shadow-sm space-y-2">
      <h2 className="text-sm font-semibold">Suggested next hiring actions</h2>
      <p className="text-xs text-gray-500">
        Powered by your /api/ai-insights endpoint. If AI is unavailable, we’ll
        fall back to simple heuristics.
      </p>

      {loading && (
        <div className="mt-3 space-y-2">
          <div className="h-3 rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
          <div className="h-3 w-2/3 rounded bg-gray-100" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-2">
          <p className="mb-2 text-xs text-red-600">{error}</p>
          {fallback}
        </div>
      )}

      {!loading && !error && content && (
        <div className="mt-2 space-y-2">
          <div className="rounded bg-gray-50 px-3 py-2 text-xs text-gray-700 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      )}

      {!loading && !error && !content && (
        <div className="mt-2">{fallback}</div>
      )}
    </section>
  );
}
