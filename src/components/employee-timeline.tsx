"use client";

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

type EmployeeTimelineProps = {
  events: EventItem[];
};

function formatDate(date?: string) {
  if (!date) return "Unknown date";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown date";

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupByDay(events: EventItem[]) {
  const groups: Record<string, EventItem[]> = {};
  for (const e of events) {
    const key = e.createdAt
      ? new Date(e.createdAt).toISOString().slice(0, 10) // YYYY-MM-DD
      : "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }

  // sort newest day first
  return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

function badgeForSource(source: string) {
  const s = source.toLowerCase();
  if (s.includes("ats") || s.includes("hiring")) {
    return { label: "Hiring", className: "bg-sky-50 text-sky-700 border-sky-100" };
  }
  if (s.includes("timeoff") || s.includes("pto")) {
    return {
      label: "Time off",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    };
  }
  if (s.includes("performance") || s.includes("review")) {
    return {
      label: "Performance",
      className: "bg-purple-50 text-purple-700 border-purple-100",
    };
  }
  if (s.includes("system") || s.includes("sync")) {
    return { label: "System", className: "bg-slate-50 text-slate-600 border-slate-100" };
  }
  return { label: source || "Event", className: "bg-slate-50 text-slate-600 border-slate-100" };
}

function iconForType(type: string) {
  const t = type.toLowerCase();

  if (t.includes("hire") || t.includes("onboard")) {
    return "🧑‍💼";
  }
  if (t.includes("timeoff") || t.includes("pto") || t.includes("leave")) {
    return "🏝️";
  }
  if (t.includes("review") || t.includes("feedback") || t.includes("performance")) {
    return "📊";
  }
  if (t.includes("note") || t.includes("comment")) {
    return "📝";
  }
  if (t.includes("comp") || t.includes("salary") || t.includes("pay")) {
    return "💸";
  }

  return "•";
}

export default function EmployeeTimeline({ events }: EmployeeTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-sm text-slate-500">
        <div className="font-medium text-slate-700">No timeline events yet</div>
        <p className="mt-1 text-xs text-slate-500">
          As hires, time off, reviews, and other changes are logged in Intime,
          they&apos;ll appear here as a chronological story for this person.
        </p>
      </div>
    );
  }

  const grouped = groupByDay(events);

  return (
    <div className="space-y-4">
      {grouped.map(([dayKey, items]) => (
        <div key={dayKey} className="space-y-2">
          {/* Day header */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="whitespace-nowrap font-medium text-slate-600">
              {dayKey === "unknown" ? "Unknown date" : formatDate(items[0]?.createdAt)}
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Events for this day */}
          <ol className="relative space-y-3 border-l border-slate-200 pl-3">
            {items
              .slice()
              .sort((a, b) => {
                const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
                const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
                return tb - ta; // newest first within the day
              })
              .map((event, idx) => {
                const badge = badgeForSource(event.source || "");
                const time = formatTime(event.createdAt);

                return (
                  <li key={event.id ?? `${dayKey}-${idx}`} className="relative pl-3">
                    {/* Dot */}
                    <span className="absolute -left-[9px] top-2 h-2 w-2 rounded-full bg-slate-300 ring-2 ring-slate-100" />

                    <div className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                      <div className="flex gap-3">
                        <div className="mt-0.5 text-lg leading-none">
                          {iconForType(event.type || "")}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-slate-900">
                            {event.type || "Event"}
                          </div>
                          {event.summary && (
                            <p className="text-xs text-slate-600 leading-snug">
                              {event.summary}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                            <span>{badge.label}</span>
                            {time && <span>• {time}</span>}
                          </div>
                        </div>
                      </div>

                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          badge.className,
                        ].join(" ")}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </li>
                );
              })}
          </ol>
        </div>
      ))}
    </div>
  );
}
