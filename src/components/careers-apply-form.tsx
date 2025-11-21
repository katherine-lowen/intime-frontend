// src/components/careers-apply-form.tsx
"use client";

import { useState, FormEvent } from "react";

type PublicQuestion = {
  id: string;
  label: string;
  helpText?: string | null;
  type: string;
  required: boolean;
};

type CareersApplyFormProps = {
  jobId: string;
  jobTitle: string;
  questions: PublicQuestion[];
};

export default function CareersApplyForm({
  jobId,
  jobTitle,
  questions,
}: CareersApplyFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        email,
        resumeText: resumeText || undefined,
        source: "public_job_board",
        answers: questions.map((q) => ({
          questionId: q.id,
          value: answers[q.id] ?? "",
        })),
      };

      const res = await fetch(`${api}/careers/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Apply failed", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      setSuccess(true);
    } catch (err) {
      console.error("Error submitting application", err);
      setError("Something went wrong submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-semibold">
          Application received for {jobTitle}.
        </p>
        <p className="mt-1 text-xs">
          Thanks for applying! We&apos;ll review your profile and reach out if
          there&apos;s a fit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Full name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700">
          Paste your resume (optional)
        </label>
        <textarea
          rows={5}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="You can paste your resume or a short summary here."
        />
      </div>

      {questions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-700">
            Additional questions
          </p>
          {questions.map((q) => (
            <div key={q.id} className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                {q.label}
                {q.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {q.helpText && (
                <p className="text-[11px] text-slate-500">{q.helpText}</p>
              )}
              {/* For now, treat all question types as free-text inputs */}
              <textarea
                rows={3}
                required={q.required}
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400">
                Type: {q.type.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
