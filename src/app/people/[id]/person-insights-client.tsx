// src/app/people/[id]/person-insights-client.tsx
"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";

type Props = {
  employeeId: string;
  fullName: string;
  title?: string | null;
  department?: string | null;
  status?: string | null;
  daysInOrg: number | null;
};

type AiInsightsResponse = {
  insights?: string;
  summary?: string;
  message?: string;
  text?: string;
  // allow arbitrary extra fields without TS complaining
  [key: string]: unknown;
};

export default function PersonInsightsClient({
  employeeId,
  fullName,
  title,
  department,
  status,
  daysInOrg,
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
            scope: "person",
            employeeId,
            fullName,
            title,
            department,
            status,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: AiInsightsResponse = await res.json();

        if (cancelled) return;

        const text =
          data.insights ||
          data.summary ||
          data.message ||
          data.text ||
          // very defensive fallback so we always show *something*
          JSON.stringify(data, null, 2);

        setContent(text);
      } catch (err) {
        console.error("AI insights error", err);
        if (!cancelled) {
          setError("Unable to load AI suggestions right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInsights();

    return () => {
      cancelled = true;
    };
  }, [employeeId, fullName, title, department, status]);

  // Fallback heuristics if AI fails
  const fallback = (
    <ul className="mt-2 space-y-2 text-sm">
      {daysInOrg != null && daysInOrg < 30 && (
        <li className="rounded bg-gray-50 px-3 py-2">
          <div className="text-xs font-medium text-gray-700">
            New hire onboarding
          </div>
          <div className="text-xs text-gray-600">
            They’re still within their first month. Make sure onboarding tasks,
            access to tools, and 30-day expectations are clearly set.
          </div>
        </li>
      )}

      {daysInOrg != null && daysInOrg >= 180 && (
        <li className="rounded bg-gray-50 px-3 py-2">
          <div className="text-xs font-medium text-gray-700">
            Mid-cycle performance check-in
          </div>
          <div className="text-xs text-gray-600">
            Consider a structured performance and engagement conversation if you
            haven’t had one recently.
          </div>
        </li>
      )}

      <li className="rounded bg-gray-50 px-3 py-2">
        <div className="text-xs font-medium text-gray-700">
          Keep the timeline healthy
        </div>
        <div className="text-xs text-gray-600">
          Log promotions, role changes, reviews, and leaves so you always have a
          clear history for this person.
        </div>
      </li>
    </ul>
  );

  return (
    <section className="rounded border bg-white p-4 text-sm shadow-sm space-y-2">
      <h2 className="text-sm font-semibold">Suggested next actions</h2>
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
          {/* We expect AI to return either bullet-style text or a short paragraph. */}
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
