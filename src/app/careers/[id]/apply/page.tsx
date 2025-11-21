// src/app/careers/[id]/apply/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

type ApplyQuestion = {
  id: string;
  label: string;
  helpText?: string | null;
  type: string;
  required: boolean;
  options?: string[];
};

type JobForApply = {
  job: {
    id: string;
    title: string;
    location?: string | null;
    department?: string | null;
    description?: string | null;
  };
  questions: ApplyQuestion[];
};

type AnswersState = Record<string, string>;

export default function PublicApplyPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;

  const [data, setData] = useState<JobForApply | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("public_job_board");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load job + questions
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<JobForApply>(`/careers/jobs/${jobId}/app`);
        if (!cancelled) {
          setData(res);
          // initialise answers map
          const initial: AnswersState = {};
          res.questions.forEach((q) => {
            initial[q.id] = "";
          });
          setAnswers(initial);
        }
      } catch (e) {
        console.error("Failed to load public job", e);
        if (!cancelled) setError("We couldn’t load this role. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!data || !jobId) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        source: source || undefined,
        resumeText: resumeText.trim() || undefined,
        answers: Object.entries(answers)
          .filter(([, value]) => value && value.trim().length > 0)
          .map(([questionId, value]) => ({
            questionId,
            answer: value.trim(),
          })),
      };

      await api.post(`/careers/jobs/${jobId}/apply`, payload);
      setSuccess(true);
    } catch (e) {
      console.error("Apply failed", e);
      setError("Something went wrong submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const job = data?.job;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Careers
            </p>
            <Link
              href="/careers"
              className="mt-1 inline-flex items-center text-xs text-slate-500 hover:text-slate-700"
            >
              ← Back to all roles
            </Link>
          </div>
          {job && (
            <p className="text-xs font-medium text-slate-700">
              Applying for <span className="font-semibold">{job.title}</span>
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading role…
          </div>
        )}

        {!loading && error && !job && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && job && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
            {/* Form */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                Apply for {job.title}
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Share a few details and we&apos;ll follow up if there&apos;s a match.
              </p>

              {success ? (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <p className="font-semibold">Application submitted</p>
                  <p className="mt-1 text-xs">
                    Thanks for applying! The team will review your profile and reach
                    out if they&apos;d like to move forward.
                  </p>
                  <Link
                    href="/careers"
                    className="mt-3 inline-flex text-xs font-medium text-emerald-800 underline"
                  >
                    Back to all roles →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
                  {/* Basic info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">
                        Full name<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      How did you hear about this role?
                    </label>
                    <input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
                      placeholder="e.g. LinkedIn, referral, company website"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Paste your resume / LinkedIn
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
                      placeholder="You can paste a resume, LinkedIn URL, or short summary of your experience."
                    />
                  </div>

                  {/* Dynamic questions */}
                  {data?.questions?.length ? (
                    <div className="space-y-3 pt-2">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Application questions
                      </h2>
                      {data.questions.map((q) => (
                        <div key={q.id} className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">
                            {q.label}
                            {q.required && <span className="text-red-500">*</span>}
                          </label>
                          {q.helpText && (
                            <p className="text-[11px] text-slate-500">{q.helpText}</p>
                          )}

                          {q.options && q.options.length > 0 ? (
                            <select
                              required={q.required}
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                            >
                              <option value="">Select an option</option>
                              {q.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <textarea
                              required={q.required}
                              rows={3}
                              value={answers[q.id] ?? ""}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
                              placeholder="Type your answer…"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {error && (
                    <p className="text-xs text-red-600">
                      {error}
                    </p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-50 shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Submitting…" : "Submit application"}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Sidebar summary */}
            <aside className="space-y-4 lg:pt-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  About this role
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  {job.department && (
                    <>
                      <span className="font-medium">{job.department}</span>
                      {" team · "}
                    </>
                  )}
                  {job.location || "Remote / flexible"}
                </p>
                <p className="mt-3 text-[11px] text-slate-500">
                  You can always update your information with the hiring team
                  later in the process.
                </p>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-900">What to expect</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Quick review by the recruiting team</li>
                  <li>Intro call if there&apos;s a potential fit</li>
                  <li>Role-specific interviews</li>
                  <li>Offer &amp; onboarding for successful candidates</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
