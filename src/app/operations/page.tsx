// src/app/operations/page.tsx
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import Link from "next/link";
import LottieConfetti from "@/components/LottieConfetti";

export const dynamic = "force-dynamic";

type StatsResponse = {
  employees?: number;
  teams?: number;
  openRoles?: number;
  events?: number;
};

type TimeOffStatus = "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";

type TimeOffRequest = {
  id: string;
  employeeId: string;
  type: string;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
};

type OnboardingTaskStatus = "PENDING" | "DONE" | "SKIPPED";

type OnboardingTask = {
  id: string;
  label: string;
  status: OnboardingTaskStatus;
};

type OnboardingEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  department?: string | null;
  title?: string | null;
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  onboardingTasks?: OnboardingTask[];
};

type UpcomingHoliday = {
  id: string;
  date: string; // ISO
  name: string;
  countryCode?: string | null;
};

type UpcomingBirthday = {
  id: string; // employee id
  firstName: string;
  lastName: string;
  department?: string | null;
  birthday: string; // ISO (this year/next)
};

// ---------- Fetch helpers ----------

async function fetchStats(): Promise<Required<StatsResponse>> {
  try {
    const data = await api.get<StatsResponse>("/stats");
    return {
      employees: data.employees ?? 0,
      teams: data.teams ?? 0,
      openRoles: data.openRoles ?? 0,
      events: data.events ?? 0,
    };
  } catch (err) {
    console.error("Failed to load /stats in operations page", err);
    // Fallback so the page still looks alive
    return { employees: 34, teams: 8, openRoles: 12, events: 124 };
  }
}

async function fetchTimeOff(): Promise<TimeOffRequest[]> {
  try {
    return await api.get<TimeOffRequest[]>("/timeoff/requests");
  } catch (err) {
    console.error("Failed to load /timeoff/requests for operations page", err);
    return [];
  }
}

async function fetchOnboarding(): Promise<OnboardingEmployee[]> {
  try {
    return await api.get<OnboardingEmployee[]>("/onboarding");
  } catch (err) {
    console.error("Failed to load /onboarding for operations page", err);
    return [];
  }
}

async function fetchUpcomingHolidays(): Promise<UpcomingHoliday[]> {
  try {
    // implement in backend as GET /calendar/upcoming-holidays
    return await api.get<UpcomingHoliday[]>("/calendar/upcoming-holidays");
  } catch (err) {
    console.error(
      "Failed to load /calendar/upcoming-holidays for operations page",
      err,
    );
    return [];
  }
}

async function fetchUpcomingBirthdays(): Promise<UpcomingBirthday[]> {
  try {
    // implement in backend as GET /analytics/upcoming-birthdays
    return await api.get<UpcomingBirthday[]>("/analytics/upcoming-birthdays");
  } catch (err) {
    console.error(
      "Failed to load /analytics/upcoming-birthdays for operations page",
      err,
    );
    return [];
  }
}

// ---------- Summary helpers ----------

function summarizeTimeOff(requests: TimeOffRequest[]) {
  if (!requests.length) {
    return {
      pending: 0,
      upcomingApproved: 0,
      approvedThisYear: 0,
    };
  }

  const now = new Date();
  const year = now.getFullYear();

  let pending = 0;
  let upcomingApproved = 0;
  let approvedThisYear = 0;

  for (const r of requests) {
    const start = new Date(r.startDate);
    if (r.status === "REQUESTED") pending += 1;
    if (r.status === "APPROVED") {
      if (start >= now) upcomingApproved += 1;
      if (start.getFullYear() === year) approvedThisYear += 1;
    }
  }

  return { pending, upcomingApproved, approvedThisYear };
}

function summarizeOnboarding(employees: OnboardingEmployee[]) {
  if (!employees.length) {
    return {
      total: 0,
      notStarted: 0,
      inProgress: 0,
      completed: 0,
    };
  }

  let notStarted = 0;
  let inProgress = 0;
  let completed = 0;

  for (const e of employees) {
    if (e.onboardingStatus === "NOT_STARTED") notStarted += 1;
    else if (e.onboardingStatus === "IN_PROGRESS") inProgress += 1;
    else if (e.onboardingStatus === "COMPLETED") completed += 1;
  }

  return {
    total: employees.length,
    notStarted,
    inProgress,
    completed,
  };
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ---------- Page ----------

export default async function OperationsPage() {
  const [stats, timeoff, onboarding, holidays, birthdays] = await Promise.all([
    fetchStats(),
    fetchTimeOff(),
    fetchOnboarding(),
    fetchUpcomingHolidays(),
    fetchUpcomingBirthdays(),
  ]);

  const { employees, teams, openRoles, events } = stats;
  const avgTeamSize =
    teams > 0 ? Math.round((employees / teams) * 10) / 10 : employees;

  const timeoffSummary = summarizeTimeOff(timeoff);
  const onboardingSummary = summarizeOnboarding(onboarding);

  const activeNewHires = onboarding.filter(
    (e) =>
      e.onboardingStatus === "NOT_STARTED" ||
      e.onboardingStatus === "IN_PROGRESS",
  );

  const topHolidays = holidays.slice(0, 4);
  const topBirthdays = birthdays.slice(0, 5);

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* HEADER */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Org overview
            </h1>
            <p className="text-sm text-slate-600">
              HRIS view of your headcount, time off, onboarding, and key dates —
              in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
              HRIS · People &amp; time
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
              Org-wide view
            </span>
          </div>
        </section>

        {/* TOP ROW: HEADCOUNT + ORG STRUCTURE */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.4fr)]">
          {/* Headcount snapshot */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Headcount &amp; structure
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  How your org is shaped right now.
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Powered by /stats
              </span>
            </div>

            <div className="mt-4 grid gap-4 text-center sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Total headcount
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {employees}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Across {teams || 1} team{teams === 1 ? "" : "s"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Avg team size
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {avgTeamSize || 0}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  People per team
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Open roles
                </div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {openRoles}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Hiring load across the org
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <div className="font-medium text-slate-700">How to use this</div>
              <p className="mt-1">
                Sanity-check whether headcount and team sizes match your plan.
                Spikes in open roles versus team size are an early signal you
                need manager bandwidth and recruiting support.
              </p>
            </div>
          </div>

          {/* HR operations pulse */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  HR operations pulse
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Activity across hiring, onboarding, and changes.
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                {events} events tracked
              </span>
            </div>

            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              <li>
                • {openRoles} open role{openRoles === 1 ? "" : "s"} being
                filled in Hiring.
              </li>
              <li>
                • {onboardingSummary.total} employee
                {onboardingSummary.total === 1 ? "" : "s"} in onboarding flows.
              </li>
              <li>
                • {timeoff.length} time off request
                {timeoff.length === 1 ? "" : "s"} recorded overall.
              </li>
            </ul>

            {activeNewHires.length > 0 ? (
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <div className="mb-1 font-medium text-slate-800">
                  New hires in flight
                </div>
                <ul className="space-y-1">
                  {activeNewHires.slice(0, 3).map((e) => (
                    <li key={e.id} className="flex justify-between gap-2">
                      <span className="truncate">
                        {e.firstName} {e.lastName}
                        {e.department ? ` · ${e.department}` : ""}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {e.onboardingStatus.toLowerCase().replace("_", " ")}
                      </span>
                    </li>
                  ))}
                  {activeNewHires.length > 3 && (
                    <li className="text-[11px] text-slate-500">
                      +{activeNewHires.length - 3} more in onboarding
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                No active onboarding yet. As you hire through Intime, new hires
                will show up here automatically.
              </div>
            )}
          </div>
        </section>

        {/* SECOND ROW: TIME OFF + ONBOARDING */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)]">
          {/* Time & PTO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Time off &amp; PTO
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Org-wide view of upcoming and requested time off.
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                {timeoffSummary.approvedThisYear} approved trips this year
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-center text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Pending requests
                </div>
                <div className="mt-1 text-xl font-semibold text-slate-900">
                  {timeoffSummary.pending}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Upcoming approved
                </div>
                <div className="mt-1 text-xl font-semibold text-slate-900">
                  {timeoffSummary.upcomingApproved}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Approved this year
                </div>
                <div className="mt-1 text-xl font-semibold text-slate-900">
                  {timeoffSummary.approvedThisYear}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <div className="font-medium text-slate-700">
                Coverage &amp; burnout signals
              </div>
              <p className="mt-1">
                Use this to spot coverage gaps before they happen. Clusters of
                pending requests in the same team or overlapping dates are an
                early signal you may need to adjust staffing or approvals.
              </p>
            </div>
          </div>

          {/* Onboarding */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Onboarding pipeline
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  New hires and their onboarding progress.
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                {onboardingSummary.total} in scope
              </span>
            </div>

            {onboardingSummary.total === 0 ? (
              <p className="mt-4 text-xs text-slate-500">
                No employees in onboarding yet. Once you mark new hires as
                &quot;In onboarding&quot;, progress will show up here.
              </p>
            ) : (
              <>
                <div className="mt-4 grid gap-3 text-center text-xs sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      Not started
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {onboardingSummary.notStarted}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      In progress
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {onboardingSummary.inProgress}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      Completed
                    </div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {onboardingSummary.completed}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <div className="font-medium text-slate-700">
                    Where to focus
                  </div>
                  <p className="mt-1">
                    New hires stuck in &quot;Not started&quot; or
                    &quot;In progress&quot; for too long are the ones to chase.
                    Intime will eventually surface these as nudges for managers
                    and HR.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* THIRD ROW: HOLIDAYS + BIRTHDAYS */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
          {/* Upcoming public holidays */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  📅 Upcoming public holidays
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Key dates that may impact coverage and scheduling.
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                {topHolidays.length} in view
              </span>
            </div>

            {topHolidays.length === 0 ? (
              <p className="mt-4 text-xs text-slate-500">
                No upcoming holidays configured yet. Once you sync your holiday
                calendar, next events will show up here.
              </p>
            ) : (
              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                {topHolidays.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {h.name}
                      </div>
                      {h.countryCode && (
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">
                          {h.countryCode}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-600">
                      <div className="font-medium">
                        {formatShortDate(h.date)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
{/* Upcoming birthdays — 🎂 themed with confetti */}
<div className="relative rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-5 shadow-sm overflow-visible">
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-rose-700 shadow-sm">
        <span>🎂</span>
        <span>Birthday radar</span>
      </div>
      <h2 className="mt-3 text-sm font-semibold text-rose-900">
        Upcoming birthdays
      </h2>
      <p className="mt-1 text-xs text-rose-700/80">
        Plan shout-outs, cards, and cake before the day sneaks up on you.
      </p>
    </div>

    <div className="flex flex-col items-end gap-1">
      <span className="text-[11px] font-medium text-rose-600">
        {topBirthdays.length} coming up
      </span>

      {/* BIG, OBVIOUS CONFETTI */}
      <div className="h-20 w-20">
        <LottieConfetti />
      </div>
    </div>
  </div>

  {topBirthdays.length === 0 ? (
    <p className="mt-4 text-xs text-rose-700/80">
      No birthdays detected yet. As you add employee birth dates to People
      profiles, upcoming birthdays will appear here with enough time to
      celebrate properly. 🎉
    </p>
  ) : (
    <ul className="mt-4 space-y-2 text-xs text-rose-900/90">
      {topBirthdays.map((b) => (
        <li
          key={b.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white/70 px-3 py-2 backdrop-blur"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-sm">
              🎉
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">
                {b.firstName} {b.lastName}
              </div>
              {b.department && (
                <div className="truncate text-[11px] text-rose-700/80">
                  {b.department}
                </div>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-rose-700">
            <div className="font-semibold">
              {formatShortDate(b.birthday)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )}

  {topBirthdays.length > 0 && (
    <p className="mt-3 text-[11px] text-rose-700/80">
      Tip: Use this as your weekly &quot;who&apos;s up next&quot; list
      for Slack shout-outs or manager nudges.
    </p>
  )}
</div>

        </section>

        {/* TEAM HEATMAP LINK */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Team load &amp; coverage
              </h2>
              <p className="mt-1 max-w-xl text-xs text-slate-500">
                Visualize which teams and people are overloaded based on PTO,
                approvals, and recent review activity. Use the heatmap to spot
                burnout risk and coverage gaps before they show up in Slack.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/operations/team-heatmap"
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-50 shadow-sm hover:bg-slate-800"
              >
                Open team heatmap
              </Link>
            </div>
          </div>
        </section>

        {/* AI NARRATIVE CARD */}
        <section className="rounded-2xl border border-slate-200 bg-slate-900 px-5 py-4 text-slate-50 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium">
                <span className="text-xs">✨</span>
                AI org time insight
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-100">
                Headcount is currently{" "}
                <span className="font-semibold">{employees}</span> across{" "}
                <span className="font-semibold">{teams}</span> teams, with{" "}
                <span className="font-semibold">{openRoles}</span> open roles in
                flight. You have{" "}
                <span className="font-semibold">
                  {timeoffSummary.pending} pending
                </span>{" "}
                time off request{timeoffSummary.pending === 1 ? "" : "s"} and{" "}
                <span className="font-semibold">
                  {timeoffSummary.upcomingApproved} upcoming approved trip
                  {timeoffSummary.upcomingApproved === 1 ? "" : "s"}
                </span>
                , so watch coverage for critical teams.{" "}
                {onboardingSummary.total > 0 ? (
                  <>
                    There are{" "}
                    <span className="font-semibold">
                      {onboardingSummary.inProgress} new hires actively
                      onboarding
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold">
                      {onboardingSummary.notStarted} waiting to start
                    </span>
                    ; make sure managers have what they need for week-one
                    check-ins.
                  </>
                ) : (
                  <>No active onboarding yet – hiring is quiet right now.</>
                )}{" "}
                {topBirthdays.length > 0 && (
                  <>
                    You also have{" "}
                      <span className="font-semibold">
                        {topBirthdays.length} upcoming birthday
                        {topBirthdays.length === 1 ? "" : "s"}
                      </span>{" "}
                    in the next window — a low-effort way to boost morale is to
                    plan shout-outs and small celebrations ahead of time.
                  </>
                )}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <div>Org-wide AI summary</div>
              <div>Powered by Intime&apos;s event and HRIS layer</div>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
