// src/app/timeoff/page.tsx
import api from "@/lib/api";
import TimeoffRequestsTable, {
  TimeOffRequestItem,
  TimeOffStatus,
} from "@/components/timeoff-requests-table";
import TimeoffCalendar from "@/components/timeoff-calendar";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import { CalendarClock, Umbrella, Users } from "lucide-react";
import TimeoffPolicySummaryCard from "@/components/timeoff-policy-summary-card";

export const dynamic = "force-dynamic";

async function getRequests(
  status?: TimeOffStatus
): Promise<TimeOffRequestItem[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return api.get(`/timeoff/requests${query}`);
}

// Safe wrapper so a failing API call doesn't break the Server Component
async function safeGetRequests(
  status: TimeOffStatus
): Promise<TimeOffRequestItem[]> {
  try {
    return await getRequests(status);
  } catch (err) {
    console.error(`Failed to load time off requests for status=${status}`, err);
    return [];
  }
}

export default async function TimeOffPage() {
  const [requested, approved, denied] = await Promise.all([
    safeGetRequests("REQUESTED"),
    safeGetRequests("APPROVED"),
    safeGetRequests("DENIED"),
  ]);

  const totalRequests = requested.length + approved.length + denied.length;
  const pendingCount = requested.length;
  const approvedCount = approved.length;
  const deniedCount = denied.length;

  // Build "upcoming" data for the dashboard calendar (requested + approved, future or today)
  const now = Date.now();
  const upcomingRaw = [...requested, ...approved].filter((req) => {
    const end = (req as any).endDate
      ? Date.parse((req as any).endDate as string)
      : NaN;
    return !Number.isNaN(end) && end >= now;
  });

  const calendarRequests = upcomingRaw.map((req) => {
    const anyReq = req as any;
    const employeeName =
      anyReq.employeeName ||
      [anyReq.employee?.firstName, anyReq.employee?.lastName]
        .filter(Boolean)
        .join(" ") ||
      anyReq.employee?.name ||
      "Employee";

    return {
      id: req.id,
      employeeName,
      type: anyReq.type ?? "PTO",
      status: anyReq.status,
      startDate: anyReq.startDate,
      endDate: anyReq.endDate,
    };
  });

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Time off
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              See requests across the org, understand who&apos;s out, and keep
              PTO policies running smoothly.
            </p>
          </div>
          <Link
            href="/timeoff/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            New request
          </Link>
        </header>

        {/* DASHBOARD ROW */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
          {/* Left: stats + helper + policy coverage */}
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <TimeoffStatCard
                icon={<CalendarClock className="h-4 w-4" />}
                label="Upcoming time off"
                value={calendarRequests.length}
                helper="Next few weeks"
              />
              <TimeoffStatCard
                icon={<Umbrella className="h-4 w-4" />}
                label="Pending decisions"
                value={pendingCount}
                helper="Awaiting approval"
              />
              <TimeoffStatCard
                icon={<Users className="h-4 w-4" />}
                label="Total requests"
                value={totalRequests}
                helper={`${approvedCount} approved · ${deniedCount} denied`}
              />
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Use this page as your PTO control center: incoming requests,
              upcoming time away, and a clear view of capacity across the org.
            </div>

            {/* Policy coverage summary */}
            <TimeoffPolicySummaryCard />
          </div>

          {/* Calendar / upcoming view */}
          <TimeoffCalendar requests={calendarRequests} />
        </section>

        {/* REQUEST BUCKETS */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Requests by status
            </h2>
            <p className="text-xs text-slate-500">
              Approve or decline, and keep a record of historical decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Awaiting */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Awaiting approval
              </h3>
              {requested.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No requests in this bucket.
                </p>
              ) : (
                <TimeoffRequestsTable items={requested} showActions />
              )}
            </div>

            {/* Approved */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Approved
              </h3>
              {approved.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No requests in this bucket.
                </p>
              ) : (
                <TimeoffRequestsTable items={approved} />
              )}
            </div>

            {/* Denied */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Denied
              </h3>
              {denied.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No requests in this bucket.
                </p>
              ) : (
                <TimeoffRequestsTable items={denied} />
              )}
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}

type TimeoffStatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  helper: string;
};

function TimeoffStatCard({ icon, label, value, helper }: TimeoffStatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            {icon}
          </span>
          {label}
        </div>
      </div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <p className="mt-1 text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}
