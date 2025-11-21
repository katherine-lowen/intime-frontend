// src/components/events-timeline.tsx
"use client";

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

type Props = {
  events: EventItem[];
};

export default function EventsTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <p className="py-4 text-sm text-slate-500">
        No timeline events yet. Once activity is logged for this person, it will
        show up here.
      </p>
    );
  }

  // Sort newest → oldest
  const sorted = [...events].sort((a, b) => {
    const da = a.createdAt ? Date.parse(a.createdAt) : 0;
    const db = b.createdAt ? Date.parse(b.createdAt) : 0;
    return db - da;
  });

  return (
    <ol className="space-y-3">
      {sorted.map((ev) => (
        <li key={ev.id} className="flex gap-3">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
            <span className="flex-1 w-px bg-slate-200" />
          </div>

          {/* Card */}
          <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">{ev.type}</span>
              <span className="text-[11px] text-slate-400">
                {ev.createdAt
                  ? new Date(ev.createdAt).toLocaleString()
                  : ""}
              </span>
            </div>
            {ev.summary && (
              <p className="mt-1 text-[11px] text-slate-600">
                {ev.summary}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Source: {ev.source}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
