// src/app/hiring/ai-studio/candidate-summary/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import AiCandidateSummary from "@/components/ai-candidate-summary";

export default function HiringAiCandidateSummaryPage() {
  const [name, setName] = useState("Sample candidate");
  const [jobTitle, setJobTitle] = useState("Account Executive (Mid-market)");
  const [resumeText, setResumeText] = useState("");
  const [notes, setNotes] = useState("");

  function handleDemoFill(e: FormEvent) {
    e.preventDefault();
    setName("Taylor Nguyen");
    setJobTitle("Mid-market Account Executive");
    setResumeText(
      "Quota-carrying AE with 5+ years in B2B SaaS. Consistently 110–130% to quota. " +
        "Experience selling into IT and Finance, deal sizes $40–120k."
    );
    setNotes(
      "Strong discovery, crisp written comms. Wants a hybrid environment and clear " +
        "path to Strategic AE."
    );
  }

  return (
    <AuthGate>
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Hiring / AI Studio
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Candidate summary playground
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Experiment with how Intime will summarize candidates from resumes and recruiter
              notes before you wire this directly into your ATS flows.
            </p>
          </div>
          <Link
            href="/ai"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
          >
            ← Back to AI Studio
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)]">
          {/* Left: inputs */}
          <form className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Candidate inputs
                </h2>
                <p className="mt-1 text-xs text-neutral-600">
                  Use this with real candidates as you’re running searches.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDemoFill}
                className="rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Fill with example
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Candidate name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 focus:border-neutral-300 focus:bg-white"
                  placeholder="e.g. Taylor Nguyen"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Target role / title
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 focus:border-neutral-300 focus:bg-white"
                  placeholder="e.g. Mid-market AE"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Resume or profile text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={6}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 focus:border-neutral-300 focus:bg-white"
                placeholder="Paste the resume, LI profile, or experience summary."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Your internal notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 focus:border-neutral-300 focus:bg-white"
                placeholder="Recruiter notes, concerns, coaching, etc."
              />
            </div>

            <p className="text-[11px] text-neutral-400">
              Later this will plug directly into your candidate view and use real Intime AI
              outputs instead of placeholder text.
            </p>
          </form>

          {/* Right: AI summary preview */}
          <div className="space-y-3">
            <AiCandidateSummary
              name={name || "Unnamed candidate"}
              jobTitle={jobTitle || undefined}
              resumeText={resumeText || undefined}
              notes={notes || undefined}
            />
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
