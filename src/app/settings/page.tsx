// src/app/settings/page.tsx
import React from "react";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <main className="p-6 space-y-6">
      {/* HEADER */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="text-sm text-slate-600">
            Organization, time, and HR settings for your Intime workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="chip">Org-wide settings</span>
        </div>
      </section>

      {/* GRID: ORG / TIME & PTO / SECURITY */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)]">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* Org profile */}
          <div className="card px-5 py-4 space-y-4">
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
          <div className="card px-5 py-4 space-y-4">
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

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
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
        </div>
      </section>
    </main>
  );
}
