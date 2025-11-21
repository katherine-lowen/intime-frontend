// src/app/careers/[id]/apply/client.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Question = {
  id: string;
  label: string;
  helpText?: string | null;
  type:
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "YES_NO"
    | "SINGLE_SELECT"
    | "MULTI_SELECT"
    | "NUMBER";
  required: boolean;
  options: string[];
};

type JobForApply = {
  job: {
    id: string;
    title: string;
    location?: string | null;
    department?: string | null;
    description?: string | null;
  };
  questions: Question[];
};

export default function JobApplyClient({ data }: { data: JobForApply }) {
  const { job, questions } = data;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [source, setSource] = useState("public_job_board");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        email: email || undefined,
        resumeText: resumeText || undefined,
        source: source || undefined,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080"}/careers/jobs/${job.id}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID || "demo-org",
            "X-Api-Key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Apply error", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      setDone(true);
    } catch (err) {
      console.error("Failed to submit application", err);
      setError("Something went wrong submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <Link
          href={`/careers/${job.id}`}
          className="inline-flex text-xs font-medium text-indigo-600 hover:underline"
        >
          ← Back to role
        </Link>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-emerald-900">
            Application received
          </h1>
          <p className="mt-1 text-sm text-emerald-800">
            Thanks for applying for <span className="font-semibold">{job.title}</span>. 
            We&apos;ll review your application and reach out if there&apos;s a fit.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <Link
        href={`/careers/${job.id}`}
        className="inline-flex text-xs font-medium text-indigo-600 hover:underline"
      >
        ← Back to role
      </Link>

      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Apply
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {job.title}
        </h1>
        <p className="text-xs text-slate-500">
          Fill out the short form below to apply. Fields marked * are required.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Full name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Resume / experience (paste) *
          </label>
          <textarea
            required
            rows={6}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="Paste your resume, LinkedIn profile, or a summary of your experience."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Where did you find this role? (optional)
          </label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="LinkedIn, referral, company site, etc."
          />
        </div>

        {/* Dynamic application questions */}
        {questions.length > 0 && (
          <section className="space-y-3 border-t border-slate-100 pt-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Application questions
            </h2>
            {questions.map((q) => (
              <div key={q.id} className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  {q.label}
                  {q.required && <span className="text-red-500"> *</span>}
                </label>
                {q.helpText && (
                  <p className="text-[11px] text-slate-500">{q.helpText}</p>
                )}

                {/* Simple rendering: treat everything as text for now */}
                <textarea
                  rows={q.type === "LONG_TEXT" ? 4 : 2}
                  required={q.required}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
              </div>
            ))}
          </section>
        )}

        <div className="flex items-center justify-between pt-2">
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !name || !resumeText}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </div>
      </form>
    </main>
  );
}
