// src/app/time/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type TimeOffStatus = "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";
type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

type TimeOffRequest = {
  id: string;
  orgId: string;
  employeeId: string;
  type: TimeOffType;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  reason?: string | null;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string | null;
  };
};

async function getApprovedTimeOff(): Promise<TimeOffRequest[]> {
  try {
    // Uses the new status filter
    const data = await api.get<TimeOffRequest[]>("/timeoff?status=APPROVED");
    // normalize possible undefined → []
    return data ?? [];
  } catch (err) {
    console.error("Failed to load approved time off:", err);
    return [];
  }
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function normalizeDate(str: string): Date {
  return new Date(str);
}

export default async function TimeOverviewPage() {
  const requests = await getApprovedTimeOff();

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

  const outToday: TimeOffRequest[] = [];
  const outThisWeek: TimeOffRequest[] = [];
  const upcoming: TimeOffRequest[] = [];

  for (const r of requests) {
    const start = normalizeDate(r.startDate);
    const end = normalizeDate(r.endDate);

    const todayWithin = start <= today && end >= today;
    const weekOverlap = end >= startOfWeek && start <= endOfWeek;
    const futureAfterWeek = start > endOfWeek;

    if (todayWithin) {
      outToday.push(r);
    } else if (weekOverlap) {
      outThisWeek.push(r);
    } else if (futureAfterWeek) {
      upcoming.push(r);
    }
  }

  function renderList(label: string, items: TimeOffRequest[]) {
    if (items.length === 0) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-4 text-sm text-slate-500">
          No one {label.toLowerCase()}.
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-slate-200 bg-white/80">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Dates</th>
              <th className="px-3 py-2 text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const startStr = normalizeDate(r.startDate).toLocaleDateString();
              const endStr = normalizeDate(r.endDate).toLocaleDateString();
              const name = r.employee
                ? `${r.employee.firstName} ${r.employee.lastName}`
                : r.employeeId;

              return (
                <tr
                  key={r.id}
                  className="border-b last:border-b-0 hover:bg-slate-50/70"
                >
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium text-slate-900">{name}</div>
                    {r.employee?.title && (
                      <div className="text-xs text-slate-500">
                        {r.employee.title}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-sm">
                    <div>{startStr}</div>
                    {!isSameDay(
                      normalizeDate(r.startDate),
                      normalizeDate(r.endDate),
                    ) && (
                      <div className="text-xs text-slate-500">
                        to {endStr}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-sm text-slate-600">
                    {r.reason || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <AuthGate>
      <main className="space-y-6 p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Time overview
            </h1>
            <p className="text-sm text-slate-600">
              See who&apos;s out today and what&apos;s coming up this week.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link href="/timeoff" className="text-indigo-600 hover:underline">
              Manage time off →
            </Link>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Out today</h2>
          {renderList("out today", outToday)}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Out this week
          </h2>
          {renderList("out this week", outThisWeek)}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Upcoming</h2>
          {renderList("out upcoming", upcoming)}
        </section>
      </main>
    </AuthGate>
  );
}
