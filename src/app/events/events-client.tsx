"use client";

import * as React from "react";

type EventItem = {
  id: string;
  orgId: string;
  source: string;
  type: string;
  summary?: string | null;
  createdAt: string;
};

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333").replace(/\/$/, "");
const ORG = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function EventsClient() {
  const [rows, setRows] = React.useState<EventItem[]>([]);
  const [q, setQ] = React.useState("");
  const [source, setSource] = React.useState("All");
  const [etype, setEtype] = React.useState("All");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function refetch() {
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${API}/events`);
      url.searchParams.set("orgId", ORG);
      if (q) url.searchParams.set("q", q);
      if (source !== "All") url.searchParams.set("source", source);
      if (etype !== "All") url.searchParams.set("type", etype);
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as EventItem[] | unknown;
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refetch();
  }, []);

  const sources = React.useMemo(() => ["All", ...uniq(rows.map((r) => r.source))], [rows]);
  const types = React.useMemo(() => ["All", ...uniq(rows.map((r) => r.type))], [rows]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          className="rounded-md border border-neutral-300 p-2 text-sm"
          placeholder="Search events..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded-md border border-neutral-300 p-2 text-sm"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="rounded-md border border-neutral-300 p-2 text-sm"
          value={etype}
          onChange={(e) => setEtype(e.target.value)}
        >
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button
          onClick={refetch}
          disabled={loading}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50 disabled:opacity-60"
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      {/* List */}
      {rows.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center text-neutral-500">No events found.</div>
      ) : (
        <ul className="divide-y rounded-lg border bg-white shadow-sm">
          {rows.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                    {e.source}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {e.type}
                  </span>
                  <time className="text-xs text-neutral-500">{formatUTC(e.createdAt)}</time>
                </div>
                <div className="mt-1 text-sm text-neutral-800">
                  {e.summary ?? "No summary provided."}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatUTC(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toUTCString().replace("GMT", "UTC");
}

function uniq(arr: string[]) {
  const s = new Set(arr.filter(Boolean));
  return Array.from(s).sort();
}
