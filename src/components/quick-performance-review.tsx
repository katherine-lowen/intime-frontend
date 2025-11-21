// src/components/quick-performance-review.tsx
"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";

export default function QuickPerformanceReview({
  employeeId,
  onCreated,
}: {
  employeeId: string;
  onCreated?: () => void;
}) {
  const [summary, setSummary] = useState("");
  const [rating, setRating] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const numericRating =
        rating.trim() === "" ? undefined : Number(rating.trim());

      await api.post("/events", {
        employeeId,
        type: "PERFORMANCE_REVIEW",
        source: "MANUAL",
        summary: summary.trim(),
        rating:
          typeof numericRating === "number" && !Number.isNaN(numericRating)
            ? numericRating
            : undefined,
        startsAt: new Date().toISOString(),
      });

      setSummary("");
      setRating("");
      if (onCreated) {
        onCreated();
      } else {
        // Simple: reload so the panel + timelines pick up the new event
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
      setError("Could not save review. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Log performance review
        </h3>
      </div>

      {error && (
        <p className="text-[11px] text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-2">
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary for this review (what changed, strengths, flags)..."
          rows={3}
          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-0"
        />

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Rating (1–5)"
            className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 focus:ring-0"
          />
          <button
            type="submit"
            disabled={saving || !summary.trim()}
            className="ml-auto inline-flex items-center rounded-md border border-slate-200 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save review"}
          </button>
        </div>
      </div>
    </form>
  );
}
