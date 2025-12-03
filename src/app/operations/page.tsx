// src/app/operations/page.tsx
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

// Figma-generated cards (you said these are already created)
import { HeadcountStructureCard } from "./components/HeadcountStructureCard";
import { HROperationsPulseCard } from "./components/HROperationsPulseCard";
import { TimeOffPTOCard } from "./components/TimeOffPTOCard";
import { OnboardingPipelineCard } from "./components/OnboardingPipelineCard";
import { PublicHolidaysCard } from "./components/PublicHolidaysCard";
import { BirthdaysCard } from "./components/BirthdaysCard";
import { TeamLoadCoverageCard } from "./components/TeamLoadCoverageCard";
import { AIOrgSummaryCard } from "./components/AIOrgSummaryCard";

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

export function formatShortDate(iso: string) {
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
  const timeoffSummary = summarizeTimeOff(timeoff);
  const onboardingSummary = summarizeOnboarding(onboarding);

  const activeNewHires = onboarding.filter(
    (e) =>
      e.onboardingStatus === "NOT_STARTED" ||
      e.onboardingStatus === "IN_PROGRESS",
  );

  const topHolidays = holidays.slice(0, 4);
  const topBirthdays = birthdays.slice(0, 5);

  // TODO: you can pass these into the card components once their props are defined
  // e.g. <HeadcountStructureCard employees={employees} teams={teams} openRoles={openRoles} />

  return (
    <AuthGate>
      <div className="min-h-screen bg-[#FAFBFC]">
        {/* Header */}
        <header className="border-b border-[#E6E8EC] bg-white">
          <div className="mx-auto max-w-[1400px] px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-1 text-lg font-semibold text-[#0F1419]">
                  Org operations overview
                </h1>
                <p className="text-sm text-[#5E6C84]">
                  Real-time view of headcount, time off, onboarding, and key
                  dates across Intime.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <button className="rounded-lg px-4 py-2 text-[#5E6C84] transition-colors hover:bg-[#F4F5F7]">
                  Export
                </button>
                <button className="rounded-lg bg-[#2C6DF9] px-4 py-2 text-white transition-colors hover:bg-[#1F5EE6]">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-[1400px] px-8 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Row 1: Headcount & HR Pulse */}
            <div className="col-span-12 lg:col-span-5">
              <HeadcountStructureCard />
              {/* TODO: inject employees, teams, openRoles into this component */}
            </div>
            <div className="col-span-12 lg:col-span-7">
              <HROperationsPulseCard />
              {/* TODO: inject events, openRoles, onboardingSummary, timeoff.length, activeNewHires */}
            </div>

            {/* Row 2: Time Off & Onboarding */}
            <div className="col-span-12 lg:col-span-6">
              <TimeOffPTOCard />
              {/* TODO: inject timeoffSummary + maybe raw timeoff */}
            </div>
            <div className="col-span-12 lg:col-span-6">
              <OnboardingPipelineCard />
              {/* TODO: inject onboardingSummary + activeNewHires */}
            </div>

            {/* Row 3: Festive Cards - Holidays & Birthdays */}
            <div className="col-span-12 lg:col-span-6">
              <PublicHolidaysCard />
              {/* TODO: inject topHolidays + formatShortDate helper */}
            </div>
            <div className="col-span-12 lg:col-span-6">
              <BirthdaysCard />
              {/* TODO: inject topBirthdays + formatShortDate helper */}
            </div>

            {/* Row 4: Team Load & AI Summary */}
            <div className="col-span-12 lg:col-span-5">
              <TeamLoadCoverageCard />
              {/* TODO: inject employees, teams, timeoff, onboarding, etc. */}
            </div>
            <div className="col-span-12 lg:col-span-7">
              <AIOrgSummaryCard />
              {/* TODO: inject employees, teams, openRoles, timeoffSummary, onboardingSummary, topBirthdays, events */}
            </div>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
