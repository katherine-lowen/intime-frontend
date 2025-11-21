// src/components/ai-performance-review.tsx
"use client";

import { useState } from "react";

type Props = {
  employeeId: string;
  employeeName: string;
  roleTitle?: string | null;
};

type ReviewResult = {
  id: string;
  period?: string | null;
  rating?: string | null;
  managerSummary?: string | null;
  employeeSummary?: string | null;
  createdAt?: string | null;
};

export default function AiPerformanceReview({
  employeeId,
  employeeName,
  roleTitle,
}: Props) {
  const [period, setPeriod] = useState("");
  const [managerNotes, setManagerNotes] = useState("");
  const [selfReview, setSelfReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-performance-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          employeeName,
          roleTitle,
          period: period || undefined,
          managerNotes,
          selfReview: selfReview || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(
          data?.error ||
            data?.detail ||
            "Something went wrong generating the review.",
        );
        return;
      }

      setResult(data.review);
    } catch (err) {
      setError("Network error while generating review.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const hasInputs = managerNotes.trim().length > 0 || selfReview.trim().length > 0;

  return (
    <div className="rounded border p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium">AI Performance Review</h2>
          <p className="mt-1 text-xs text-neutral-600">
            Turn your notes into a structured review and save it to this
            employee&apos;s record.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-xs">
        <div className="space-y-1">
          <label className="block font-medium">Review period</label>
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="e.g. 2024 Annual, Q3 2025"
            className="w-full rounded border px-2 py-1 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium">Manager notes</label>
          <textarea
            value={managerNotes}
            onChange={(e) => setManagerNotes(e.target.value)}
            placeholder="Bullets about impact, strengths, risks, etc."
            rows={4}
            className="w-full rounded border px-2 py-1 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium">Self-review (optional)</label>
          <textarea
            value={selfReview}
            onChange={(e) => setSelfReview(e.target.value)}
            placeholder="Paste or summarize the employee's self-review."
            rows={3}
            className="w-full rounded border px-2 py-1 text-xs"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !hasInputs}
          className="w-full rounded border border-neutral-200 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {loading ? "Generating review…" : "Generate & save review"}
        </button>
      </form>

      {result && (
        <div className="mt-4 space-y-2 rounded border border-neutral-200 bg-neutral-50 p-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="font-medium">
              {result.period || "Review created"}
            </div>
            {result.rating && (
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                {result.rating}
              </span>
            )}
          </div>

          {result.managerSummary && (
            <div>
              <div className="text-[11px] font-semibold text-neutral-700">
                Manager summary
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[11px] text-neutral-800">
                {result.managerSummary}
              </p>
            </div>
          )}

          {result.employeeSummary && (
            <div>
              <div className="text-[11px] font-semibold text-neutral-700">
                Employee summary
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[11px] text-neutral-800">
                {result.employeeSummary}
              </p>
            </div>
          )}

          {result.createdAt && (
            <p className="mt-1 text-[10px] text-neutral-500">
              Saved{" "}
              {new Date(result.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
