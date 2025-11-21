"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "YES_NO"
  | "SINGLE_SELECT"
  | "MULTI_SELECT"
  | "NUMBER";

type PublicQuestion = {
  id: string;
  label: string;
  helpText?: string | null;
  type: QuestionType;
  required: boolean;
  options: string[];
};

type JobForApply = {
  id: string;
  title: string;
  location?: string | null;
  department?: string | null;
  description?: string | null;
};

type JobForApplyResponse = {
  job: JobForApply;
  questions: PublicQuestion[];
};

function formatCompanyFromSlug(slug: string): string {
  const cleaned = slug.replace(/-careers$/i, "");
  return cleaned
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ""))
    .join(" ")
    .trim();
}

export default function PublicApplyPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const { slug, id } = params;
  const companyName = formatCompanyFromSlug(slug);

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobForApply | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [source, setSource] = useState("public_job_board");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  // Load job + questions
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/careers/jobs/${id}/app`, {
          headers: {
            "Content-Type": "application/json",
            "X-Org-Id": ORG_ID,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as JobForApplyResponse;
        if (cancelled) return;

        setJob(data.job);
        setQuestions(data.questions ?? []);
      } catch (err) {
        console.error("Failed to load job for apply", err);
        if (!cancelled) {
          setError(
            "We couldn’t load this role right now. Please refresh or try again later."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function updateAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function toggleMultiSelect(questionId: string, option: string) {
    setAnswers((prev) => {
      const current = prev[questionId]?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
      const exists = current.includes(option);
      const nextArray = exists
        ? current.filter((o) => o !== option)
        : [...current, option];
      return {
        ...prev,
        [questionId]: nextArray.join(", "),
      };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }

    // Simple required check for dynamic questions
    for (const q of questions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (!val || !val.trim()) {
        setSubmitError("Please answer all required questions.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        resumeText: resumeText.trim() || undefined,
        source: source || undefined,
        answers: questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] ?? "",
        })),
      };

      const res = await fetch(`${API_BASE}/careers/jobs/${id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": ORG_ID,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Apply failed", res.status, text);
        throw new Error(`Apply failed: HTTP ${res.status}`);
      }

      const data = await res.json();
      setCandidateId(data.candidateId ?? null);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting application", err);
      setSubmitError(
        "Something went wrong submitting your application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm text-sm text-slate-700">
          Loading role…
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center max-w-md">
          <h1 className="text-lg font-semibold text-slate-900">
            Trouble loading this role
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {error ??
              "This role may have been closed or is temporarily unavailable."}
          </p>
          <Link
            href={`/careers/${slug}/jobs`}
            className="mt-4 inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            ← Back to all roles
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
          <Link
            href={`/careers/${slug}/jobs`}
            className="text-sm text-slate-600 hover:text-indigo-600"
          >
            ← Back to all roles
          </Link>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Application received
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">
              Thanks for applying, {name || "there"}.
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              Your application for{" "}
              <span className="font-medium">{job.title}</span> at{" "}
              <span className="font-medium">{companyName}</span> has been
              submitted.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Our team will review your experience and reach out if there’s a
              fit. You can close this tab now.
            </p>
            {candidateId && (
              <p className="mt-4 text-[11px] text-slate-500">
                Reference ID: <span className="font-mono">{candidateId}</span>
              </p>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Back link */}
        <Link
          href={`/careers/${slug}/jobs`}
          className="text-sm text-slate-600 hover:text-indigo-600"
        >
          ← Back to all roles
        </Link>

        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Apply to {companyName}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            {job.department && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                {job.department}
              </span>
            )}
            {job.location && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                {job.location}
              </span>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]">
          {/* Left: short job summary */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                About this role
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {job.description ||
                  "The hiring team hasn’t added a full description yet."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-sm text-slate-100 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                How we hire
              </p>
              <p className="mt-2 text-sm text-slate-100">
                We review every application. If there’s a strong match, a member
                of our team will reach out to schedule a conversation.
              </p>
            </div>
          </aside>

          {/* Right: application form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Submit your application
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              A few quick details so we can understand your background and fit.
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              {/* Basic info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="you@example.com"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    We’ll use this to contact you about your application.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    How did you hear about this role?
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="public_job_board">Company careers page</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="agency">Agency</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Resume / background
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={6}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Paste your resume or a short summary of your experience."
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Paste your resume text, LinkedIn summary, or key experience
                    highlights.
                  </p>
                </div>
              </div>

              {/* Dynamic application questions */}
              {questions.length > 0 && (
                <div className="pt-2 space-y-3 border-t border-slate-100 mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Application questions
                  </h3>

                  {questions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <label className="block text-xs font-medium text-slate-700">
                        {q.label}{" "}
                        {q.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      {q.helpText && (
                        <p className="text-[11px] text-slate-500">
                          {q.helpText}
                        </p>
                      )}

                      {/* Render control based on type */}
                      {q.type === "SHORT_TEXT" && (
                        <input
                          type="text"
                          value={answers[q.id] ?? ""}
                          onChange={(e) => updateAnswer(q.id, e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      )}

                      {q.type === "NUMBER" && (
                        <input
                          type="number"
                          value={answers[q.id] ?? ""}
                          onChange={(e) => updateAnswer(q.id, e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      )}

                      {q.type === "LONG_TEXT" && (
                        <textarea
                          rows={4}
                          value={answers[q.id] ?? ""}
                          onChange={(e) => updateAnswer(q.id, e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      )}

                      {q.type === "YES_NO" && (
                        <div className="mt-1 flex gap-4 text-sm text-slate-700">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name={q.id}
                              value="Yes"
                              checked={answers[q.id] === "Yes"}
                              onChange={() => updateAnswer(q.id, "Yes")}
                              className="h-3.5 w-3.5 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="radio"
                              name={q.id}
                              value="No"
                              checked={answers[q.id] === "No"}
                              onChange={() => updateAnswer(q.id, "No")}
                              className="h-3.5 w-3.5 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      )}

                      {(q.type === "SINGLE_SELECT" ||
                        q.type === "MULTI_SELECT") &&
                        q.options.length > 0 && (
                          <div className="mt-1 space-y-1 text-sm text-slate-700">
                            {q.options.map((opt) => {
                              if (q.type === "SINGLE_SELECT") {
                                return (
                                  <label
                                    key={opt}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="radio"
                                      name={q.id}
                                      value={opt}
                                      checked={answers[q.id] === opt}
                                      onChange={() =>
                                        updateAnswer(q.id, opt)
                                      }
                                      className="h-3.5 w-3.5 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                );
                              }

                              // MULTI_SELECT
                              const current =
                                answers[q.id]
                                  ?.split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean) ?? [];
                              const checked = current.includes(opt);

                              return (
                                <label
                                  key={opt}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    value={opt}
                                    checked={checked}
                                    onChange={() =>
                                      toggleMultiSelect(q.id, opt)
                                    }
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Submit + error */}
              {submitError && (
                <p className="text-xs text-red-600">{submitError}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Submitting…" : "Submit application"}
                </button>
                <p className="text-[11px] text-slate-500">
                  By submitting, you agree to share your information with{" "}
                  {companyName || "this company"} for hiring purposes.
                </p>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
