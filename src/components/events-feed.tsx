// src/components/events-feed.tsx
// Server component that fetches recent events from your Nest API
export const dynamic = "force-dynamic";

type EventItem = {
  id: string;
  orgId: string;
  source: string;    // e.g., "system", "hr", "ats"
  type: string;      // e.g., "employee.created", "job.created"
  summary?: string | null;
  createdAt: string; // ISO
};

function formatUTC(iso?: string) {
  if (!iso) return "—";
  // Deterministic UTC formatting to avoid hydration mismatches
  // YYYY-MM-DD HH:MM UTC
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm} UTC`;
}

export default async function EventsFeed() {
  const api = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333").replace(/\/$/, "");
  const org = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

  let events: EventItem[] = [];
  try {
    const url = new URL(`${api}/events`);
    url.searchParams.set("orgId", String(org));
    // If your API supports limit/order, you can add:
    // url.searchParams.set("limit", "25");
    // url.searchParams.set("order", "desc");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) events = data as EventItem[];
  } catch {
    events = [];
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <a
          href={`${api}/events?orgId=${encodeURIComponent(org)}`}
          className="text-xs font-medium text-indigo-600 underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          View raw
        </a>
      </div>
      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-neutral-500">
          No events yet. Create one with “Quick Add Event” or by using the API.
        </div>
      ) : (
        <ul className="divide-y">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-1 py-3">
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
