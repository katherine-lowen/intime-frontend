"use client";

import { useState } from "react";
import { post } from "@/lib/api";

const SOURCES = ["SLACK", "GOOGLE_CALENDAR", "ASANA", "MS365", "JIRA"] as const;
const TYPES = ["message", "calendar_event", "task_change", "pr_comment", "status_update", "page_view", "other"] as const;

export default function AddEventPage() {
  const [summary, setSummary] = useState("");
  const [source, setSource] = useState<typeof SOURCES[number]>("SLACK");
  const [type, setType] = useState<typeof TYPES[number]>("other");
  const [payload, setPayload] = useState('{"note":"demo"}');
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      const body = {
        source,
        type,
        summary: summary || type,
        payload: payload ? JSON.parse(payload) : undefined,
      };
      await post("/events/ingest", body);
      setMsg("✅ Event created! Check the Events page.");
      setSummary("");
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add Event</h1>
          <a href="/" className="text-sm rounded-xl border px-3 py-1 hover:bg-gray-100">← Back</a>
        </header>

        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-2xl border">
          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g., Interview scheduled with Alex"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select
                className="w-full rounded-xl border px-3 py-2"
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
              >
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full rounded-xl border px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
            <textarea
              className="w-full rounded-xl border px-3 py-2 font-mono text-sm"
              rows={5}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Tip: must be valid JSON.</p>
          </div>

          <button
            className="rounded-xl border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Create Event"}
          </button>
        </form>

        {msg && <p className="mt-4">{msg}</p>}
      </div>
    </main>
  );
}
