// src/components/timeoff-calendar.tsx
"use client";

type TimeOffRequest = {
  id: string;
  employeeName: string;
  type: string;   // PTO, SICK, etc.
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

  return `${s.toLocaleDateString(undefined, options)} – ${e.toLocaleDateString(
    undefined,
    options,
  )}`;
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

export default function TimeoffCalendar({ requests }: TimeoffCalendarProps) {
  if (!requests || requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        No time off requests scheduled yet. As employees start requesting PTO or
        sick time, they&apos;ll show up here on the calendar list.
      </div>
    );
  }

  // Sort by start date ascending
  const sorted = [...requests].sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Upcoming time off</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Pulled from your /timeoff/requests endpoint.
          </p>
        </div>
      </div>

      <ul className="divide-y divide-slate-100 text-sm">
        {sorted.map((req) => (
          <li key={req.id} className="flex items-center justify-between py-2.5">
            <div>
              <div className="text-sm font-medium text-slate-900">
                {req.employeeName}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {req.type} · {formatDateRange(req.startDate, req.endDate)}
              </div>
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
}
