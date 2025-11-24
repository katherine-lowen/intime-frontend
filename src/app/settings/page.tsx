// src/app/settings/page.tsx
import React from "react";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import { CheckCircle2, Circle, Clock, Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type SetupStatus = "DONE" | "IN_PROGRESS" | "NOT_STARTED";

type SetupTask = {
  id: string;
  label: string;
  description?: string;
  href: string;
  category: "Org" | "People" | "Hiring" | "Time";
  status: SetupStatus;
};

const SETUP_TASKS: SetupTask[] = [
  {
    id: "org-profile",
    label: "Set organization profile",
    description: "Company name, domain, size, and HQ location.",
    href: "/settings", // top of this page
    category: "Org",
    status: "IN_PROGRESS",
  },
  {
    id: "time-config",
    label: "Configure time & working week",
    description: "Default timezone and working days.",
    href: "/settings#time",
    category: "Time",
    status: "NOT_STARTED",
  },
  {
    id: "add-people",
    label: "Add first employees",
    description: "Import or manually add your core team.",
    href: "/people",
    category: "People",
    status: "NOT_STARTED",
  },
  {
    id: "pto-policy",
    label: "Draft PTO policy",
    description: "Define how paid time off works in your org.",
    href: "/timeoff",
    category: "Time",
    status: "NOT_STARTED",
  },
  {
    id: "first-job",
    label: "Create first job",
    description: "Set up a role and hiring pipeline.",
    href: "/jobs",
    category: "Hiring",
    status: "NOT_STARTED",
  },
  {
    id: "onboarding",
    label: "Review onboarding checklists",
    description: "Track new hires and their onboarding tasks.",
    href: "/onboarding",
    category: "People",
    status: "NOT_STARTED",
  },
];

function computeProgress(tasks: SetupTask[]) {
  const total = tasks.length;
  if (total === 0) return { done: 0, total: 0, percent: 0 };

  const done = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const percent = Math.round(((done + inProgress * 0.5) / total) * 100);

  return { done, inProgress, total, percent };
}

function statusChip(status: SetupStatus) {
  if (status === "DONE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Done
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <Clock className="h-3 w-3" />
        In progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
      <Circle className="h-3 w-3" />
      Not started
    </span>
  );
}

export default function SettingsPage() {
  const { done, inProgress, total, percent } = computeProgress(SETUP_TASKS);

  return (
    <AuthGate>
      <main className="p-6 space-y-6">
        {/* HEADER / HERO */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Intime setup
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                Company checklist
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Finish setting up your Intime workspace.
            </h1>
            <p className="text-sm text-slate-600">
              We&apos;ll walk you through the foundations: organization profile, people,
              hiring, and time-off rules.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">
                Setup progress
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {percent}% complete
              </span>
            </div>
            <div className="flex h-2 w-40 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500">
              {done} done · {inProgress} in progress · {total} total steps
            </div>
          </div>
        </section>

        {/* GRID: LEFT = CHECKLIST, RIGHT = ORG/TIME SETTINGS */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)]">
          {/* LEFT COLUMN: CHECKLIST */}
          <div className="space-y-4">
            <div className="card px-5 py-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="section-title">Company setup checklist</h2>
                  <p className="text-xs text-slate-500">
                    A guided list of steps to get Intime ready for your team.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] text-slate-500">
                  <Sparkles className="h-3 w-3" />
                  Designed for modern HR teams
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {SETUP_TASKS.map((task) => (
                  <Link
                    key={task.id}
                    href={task.href}
                    className="group flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {task.category}
                        </span>
                        {statusChip(task.status)}
                      </div>
                      <div className="text-sm font-medium text-slate-900">
                        {task.label}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] text-slate-500 group-hover:bg-slate-200">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              As you roll out Intime, this checklist becomes your admin hub:
              company profile, people, hiring, and time-aware PTO will all be
              configured here.
            </div>
          </div>

          {/* RIGHT COLUMN: ORG PROFILE + TIME SETTINGS (your existing UI) */}
          <div className="space-y-4">
            {/* Org profile */}
            <div className="card px-5 py-4 space-y-4" id="org-profile">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="section-title">Organization profile</h2>
                  <p className="text-xs text-slate-500">
                    How your company appears across Intime, offers, and documents.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="field-label" htmlFor="org-name">
                    Company name
                  </label>
                  <input
                    id="org-name"
                    name="orgName"
                    className="field-input"
                    defaultValue="Demo Organization"
                    placeholder="Example: Nerdio, Inc."
                  />
                </div>

                <div className="space-y-1">
                  <label className="field-label" htmlFor="org-domain">
                    Company domain
                  </label>
                  <input
                    id="org-domain"
                    name="orgDomain"
                    className="field-input"
                    defaultValue="demo-org.com"
                    placeholder="Example: company.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="field-label" htmlFor="org-size">
                    Company size
                  </label>
                  <select
                    id="org-size"
                    name="orgSize"
                    className="field-input"
                    defaultValue="51-200"
                  >
                    <option value="1-10">1–10</option>
                    <option value="11-50">11–50</option>
                    <option value="51-200">51–200</option>
                    <option value="201-1000">201–1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="field-label" htmlFor="hq-location">
                    HQ location
                  </label>
                  <input
                    id="hq-location"
                    name="hqLocation"
                    className="field-input"
                    placeholder="City, Country"
                    defaultValue="Remote, US"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  // wired later to POST /settings/org
                >
                  Save changes
                </button>
              </div>
            </div>

            {/* Time & working week */}
            <div className="card px-5 py-4 space-y-4" id="time">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="section-title">Time & working week</h2>
                  <p className="text-xs text-slate-500">
                    Control default timezone, workweek, and how time is tracked in
                    Intime.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="field-label" htmlFor="timezone">
                    Default timezone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    className="field-input"
                    defaultValue="America/New_York"
                  >
                    <option value="America/Los_Angeles">
                      Pacific (US) – PT
                    </option>
                    <option value="America/Denver">Mountain (US) – MT</option>
                    <option value="America/Chicago">Central (US) – CT</option>
                    <option value="America/New_York">Eastern (US) – ET</option>
                    <option value="Europe/London">Europe – London</option>
                    <option value="Europe/Berlin">Europe – Berlin</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="field-label" htmlFor="week-start">
                    Workweek & days
                  </label>
                  <select
                    id="week-start"
                    name="weekStart"
                    className="field-input"
                    defaultValue="mon-fri"
                  >
                    <option value="mon-fri">Monday–Friday</option>
                    <option value="sun-thu">Sunday–Thursday</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-100">
                <div className="font-medium text-slate-700">
                  How Intime uses this
                </div>
                <p>
                  Timezones and workdays power hiring speed, time-to-fill,
                  onboarding timelines, and PTO calculations across the platform.
                </p>
              </div>

              <div className="flex justify-end">
                <button type="button" className="btn-ghost text-xs">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ADVANCED SETTINGS (your existing right-hand cards moved down) */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* PTO policies summary */}
          <div className="card px-5 py-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="section-title">PTO & leave policies</h2>
                <p className="text-xs text-slate-500">
                  Configure company-wide paid time off rules. Detailed policy
                  builder coming next.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">
                    Default PTO policy
                  </span>
                  <span className="chip text-[10px]">
                    Draft • Not yet enforced
                  </span>
                </div>
                <p className="mt-1 text-slate-600">
                  Employees receive{" "}
                  <span className="font-semibold">15 days</span> of PTO per
                  year. Carryover up to 5 days. Manager approval required.
                </p>
              </div>

              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Assign different policies to departments or locations.</li>
                <li>Support for unlimited PTO, accrual-based, and fixed banks.</li>
                <li>Sync approved time-off into calendars automatically.</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="btn-ghost text-xs"
                // later: link to /settings/pto or /timeoff/policies
              >
                Open PTO policy builder
              </button>
            </div>
          </div>

          {/* Security / access placeholder */}
          <div className="card px-5 py-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="section-title">Access & admin</h2>
                <p className="text-xs text-slate-500">
                  Control who can change settings, see compensation, and manage
                  HR workflows.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                Role-based permissions will let you grant access to HR, managers,
                finance, and IT without exposing everything.
              </p>
              <p className="text-slate-500">
                For now, all settings changes are treated as admin-level
                actions.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
