// src/app/ai/page.tsx
"use client";

import Link from "next/link";
import AiResumeMatch from "@/components/ai-resume-match";
import { AuthGate } from "@/components/dev-auth-gate";

export default function AiToolsPage() {
  return (
    <AuthGate>
      <div className="relative">
        {/* Soft background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-slate-50" />

        <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
          {/* Header / hero */}
          <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Intime AI Studio
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                    Hiring · People · Performance
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Time-aware AI for hiring and people decisions.
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Use Intime AI to generate better roles, summarize candidates,
                  and turn messy feedback into consistent reviews — all grounded
                  in your jobs, people, and time-aware events.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    JD &amp; role creation
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    Candidate fit &amp; summaries
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    Performance &amp; reviews
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  ← Back to dashboard
                </Link>
                <a
                  href="#resume-match"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Try Resume Match
                </a>
              </div>
            </div>
          </section>

          {/* Tools grid */}
          <section className="grid gap-4 md:grid-cols-3">
            {/* Resume Match (on this page) */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                  Core tool
                </p>
                <h2 className="text-sm font-semibold text-slate-900">
                  AI Resume Match
                </h2>
                <p className="text-xs text-slate-600">
                  Score a candidate against a specific role, with clear
                  strengths, risks, and a recommended next step you can share
                  with hiring managers.
                </p>
              </div>
              <div className="mt-4">
                <a
                  href="#resume-match"
                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
                >
                  Jump to Resume Match ↓
                </a>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Profiles
                </p>
                <h2 className="text-sm font-semibold text-slate-900">
                  AI Candidate Summary
                </h2>
                <p className="text-xs text-slate-600">
                  Turn raw resumes or LinkedIn profiles into clean, recruiter-
                  ready summaries with key themes, risks, and talking points.
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/ai/summary"
                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
                >
                  Open Candidate Summary →
                </Link>
              </div>
            </div>

            {/* JD Generator */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Roles
                </p>
                <h2 className="text-sm font-semibold text-slate-900">
                  AI JD Generator
                </h2>
                <p className="text-xs text-slate-600">
                  Start from a title and a few notes. Generate a polished B2B
                  SaaS job description that matches your tone and leveling.
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/ai/jd"
                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
                >
                  Open JD Generator →
                </Link>
              </div>
            </div>

            {/* Job Intake */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Roles
                </p>
                <h2 className="text-sm font-semibold text-slate-900">
                  AI Job Intake
                </h2>
                <p className="text-xs text-slate-600">
                  Turn messy recruiter notes and hiring manager DMs into a
                  structured role profile with responsibilities, must-haves,
                  and screening questions.
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/ai/ai-job-intake"
                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
                >
                  Open Job Intake →
                </Link>
              </div>
            </div>

            {/* Performance Review */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Performance
                </p>
                <h2 className="text-sm font-semibold text-slate-900">
                  AI Performance Review
                </h2>
                <p className="text-xs text-slate-600">
                  Convert manager feedback and self-reviews into structured,
                  consistent reviews with strengths, growth areas, and suggested
                  goals.
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/ai/performance-review"
                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
                >
                  Open Performance Review →
                </Link>
              </div>
            </div>

            {/* Onboarding / employee intelligence teaser */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  People
                </p>
                <h2 className="text-sm font-semibold text-slate-900">
                  AI Onboarding &amp; People
                </h2>
                <p className="text-xs text-slate-600">
                  Use AI to draft onboarding plans, summarize employee history,
                  and surface time-based risk and trajectory signals.
                </p>
              </div>
              <div className="mt-4 text-[11px] text-slate-500">
                Connected directly to your employees, events, and reviews.
              </div>
            </div>
          </section>

          {/* How teams use Intime AI */}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.8fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                How teams use Intime AI
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Intime AI isn&apos;t a random chatbot. It&apos;s grounded in
                your jobs, candidates, employees, and time-aware events, so the
                outputs stay close to how your org actually operates.
              </p>

              <ul className="mt-3 space-y-2 text-xs text-slate-800">
                <li className="rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold">Before opening a role:</span>{" "}
                  use JD Generator + Job Intake to align with the hiring
                  manager on scope, must-haves, and success criteria.
                </li>
                <li className="rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold">During recruiting:</span>{" "}
                  paste a resume and JD into Resume Match to get a quick signal
                  and talking points before screening.
                </li>
                <li className="rounded-xl bg-slate-50 px-3 py-2">
                  <span className="font-semibold">At review time:</span> pull
                  in performance feedback and events to generate a consistent,
                  calibrated review draft.
                </li>
              </ul>

              <p className="mt-3 text-[11px] text-slate-500">
                As more of your HRIS, ATS, and time off data flows into Intime,
                these tools will automatically get smarter and more contextual.
              </p>
            </div>

            {/* Primary tool on this page: Resume Match */}
            <div
              id="resume-match"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    AI Resume Match
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Paste a job description and candidate resume or notes.
                    Intime AI will score fit, highlight strengths and risks, and
                    suggest a next step.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-700">
                  Recruiter-first workflow
                </span>
              </div>

              <div className="mt-3">
                <AiResumeMatch />
              </div>
            </div>
          </section>
        </main>
      </div>
    </AuthGate>
  );
}
