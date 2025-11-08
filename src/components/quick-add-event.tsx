// src/components/quick-add-event.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Props = {
  compact?: boolean;        // switch between button+modal later if you want
  onCreated?: () => void;   // optional callback after success
};

export default function QuickAddEvent({ compact, onCreated }: Props) {
  const router = useRouter();
  const [type, setType] = useState("hire");
  const [actor, setActor] = useState("HR Bot");
  const [description, setDescription] = useState("");
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString().slice(0, 16)); // local datetime-local format
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOk(false);

    try {
      // API expects ISO string; datetime-local lacks 'Z' so convert properly
      const iso =
        createdAt && !createdAt.endsWith("Z")
          ? new Date(createdAt).toISOString()
          : createdAt || new Date().toISOString();

      await api.post("/events/ingest", {
        type,
        actor,
        description,
        createdAt: iso,
      });

      setOk(true);
      setDescription("");
      onCreated?.();
      // Refresh server components (dashboard/analytics) so stats & tables update
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Failed to add event");
    } finally {
      setSubmitting(false);
      // Hide success after a moment
      setTimeout(() => setOk(false), 2000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Quick Add Event</h3>
        {ok && <span className="text-xs font-medium text-green-600">Saved</span>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-neutral-300 p-2 text-sm"
          >
            <option value="hire">hire</option>
            <option value="job_opened">job_opened</option>
            <option value="approval">approval</option>
            <option value="status_change">status_change</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Actor</label>
          <input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="rounded-md border border-neutral-300 p-2 text-sm"
            placeholder="System or user"
            required
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs text-neutral-600">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border border-neutral-300 p-2 text-sm"
            placeholder='e.g., "Hired Ava Morales"'
            required
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs text-neutral-600">When</label>
          <input
            type="datetime-local"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="rounded-md border border-neutral-300 p-2 text-sm"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add Event"}
        </button>
      </div>
    </form>
  );
}
