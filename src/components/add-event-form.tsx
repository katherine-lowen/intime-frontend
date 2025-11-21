"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";

const EVENT_TYPES = [
  { value: "PERFORMANCE_REVIEW", label: "Performance review" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "STATUS_CHANGE", label: "Status change" },
  { value: "GOAL_UPDATE", label: "Goal update" },
  { value: "FEEDBACK_NOTE", label: "Feedback note" },
  { value: "RECOGNITION", label: "Recognition" },
  { value: "PIP", label: "Performance plan / PIP" },
] as const;

type EventTypeValue = (typeof EVENT_TYPES)[number]["value"];

export default function AddEventForm({
  employeeId,
  defaultType = "PERFORMANCE_REVIEW",
  onCreated,
}: {
  employeeId?: string; // optional so we can reuse globally later
  defaultType?: EventTypeValue | string;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>(defaultType);
  const [summary, setSummary] = useState("");
  const [rating, setRating] = useState<string>("");
  const [effectiveAt, setEffectiveAt] = useState<string>(""); // ISO string input
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setType(defaultType);
    setSummary("");
    setRating("");
    setEffectiveAt("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const numericRating =
        rating.trim() === "" ? undefined : Number(rating.trim());

      const now = new Date();
      const startsAtISO =
        effectiveAt.trim() !== ""
          ? new Date(effectiveAt).toISOString()
          : now.toISOString();

      // Adjust body fields if your backend expects slightly different names
      await api.post("/events", {
        employeeId: employeeId ?? undefined,
        type,
        source: "MANUAL",
        summary: summary.trim(),
        rating:
          typeof numericRating === "number" && !Number.isNaN(numericRating)
            ? numericRating
            : undefined,
        startsAt: startsAtISO,
      });

      resetForm();
      setOpen(false);

      if (onCreated) {
        onCreated();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError("Could not create event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
      >
        {open ? "Close" : "Add event"}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-2 space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs"
        >
          {error && (
            <p className="text-[11px] text-red-600">
              {error}
            </p>
          )}

          {/* Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">
              Event type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 focus:ring-0"
            >
              {EVENT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Effective date */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">
              Effective date (optional)
            </label>
            <input
              type="datetime-local"
              value={effectiveAt}
              onChange={(e) => setEffectiveAt(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 focus:ring-0"
            />
            <p className="text-[10px] text-slate-500">
              If empty, we&apos;ll use now. Use this for backfilling older
              events.
            </p>
          </div>

          {/* Rating (only relevant for performance-ish events) */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">
              Rating (optional, 1–5)
            </label>
            <input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 focus:ring-0"
            />
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600">
              Summary / notes
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Describe what happened, why it matters, and any context managers need later…"
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-slate-400 focus:ring-0"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !summary.trim()}
              className="inline-flex items-center rounded-md border border-slate-200 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save event"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
