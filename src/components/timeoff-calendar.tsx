// src/components/timeoff-calendar.tsx
"use client";

type TimeOffRequest = {
  id: string;
  employeeName: string;
  type: string; // PTO, SICK, etc.
  status: string; // REQUESTED, APPROVED, DENIED, CANCELLED
  startDate: string;
  endDate: string;
};

type TimeoffCalendarProps = {
  requests: TimeOffRequest[];
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);

  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (sameDay) {
    return s.toLocaleDateString(undefined, options);
  }

  return `${s.toLocaleDateString(
    undefined,
    options,
  )} – ${e.toLocaleDateString(undefined, options)}`;
}

function statusBadgeClasses(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "REQUESTED":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "DENIED":
      return "bg-rose-50 text-rose-700 border-rose-100";
    case "CANCELLED":
      return "bg-slate-50 text-slate-500 border-slate-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
}

function getBucketLabel(startDate: string) {
  const start = new Date(startDate);
  const today = new Date();

  // normalize to midnight
  const d0 = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const ds = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();

  const diffDays = Math.round((ds - d0) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays > 0 && diffDays <= 7) return "This week";
  return "Later";
}

export default function TimeoffCalendar({ requests }: TimeoffCalendarProps) {
  // Filter to upcoming-ish requests and ignore fully past items
  const now = new Date().getTime();
  const upcoming = (requests || []).filter((req) => {
    const end = new Date(req.endDate).getTime();
    return end >= now; // still upcoming or in progress
  });

  if (!upcoming || upcoming.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        No upcoming time off on the books. As employees request PTO or sick time,
        their plans will show up here.
      </div>
    );
  }

  // Sort by start date ascending
  const sorted = [...upcoming].sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  // Group into buckets
  const buckets: Record<string, TimeOffRequest[]> = {};
  for (const req of sorted) {
    const label = getBucketLabel(req.startDate);
    if (!buckets[label]) buckets[label] = [];
    buckets[label].push(req);
  }

  const bucketOrder: string[] = ["Today", "This week", "Later"];

  const totalApproved = upcoming.filter((r) => r.status === "APPROVED").length;
  const totalRequested = upcoming.filter((r) => r.status === "REQUESTED").length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Upcoming time off
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Next few weeks of PTO and leave across your org.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            {totalApproved} approved
          </span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
            {totalRequested} pending
          </span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {bucketOrder.map((bucket) => {
          const items = buckets[bucket];
          if (!items || items.length === 0) return null;

          return (
            <div key={bucket} className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                {bucket}
              </div>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60">
                {items.map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {req.employeeName}
                      </span>
                      <span className="mt-0.5 text-xs text-slate-500">
                        {req.type} · {formatDateRange(req.startDate, req.endDate)}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusBadgeClasses(
                        req.status,
                      )}`}
                    >
                      {req.status.toLowerCase().replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
