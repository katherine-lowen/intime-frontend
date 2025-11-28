// src/components/careers-apply-form.tsx
"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

type Question = {
  id: string;
  label: string;
  helpText?: string | null;
  type: string;
  required: boolean;
  optionsJson?: any;
};

export type PublicJobDetail = {
  id: string;
  title: string;
  applicationTemplate: {
    id: string;
    name: string;
    description?: string | null;
    questions: Question[];
  } | null;
};

type CareersApplyFormProps = {
  job: PublicJobDetail;
};

export default function CareersApplyForm({ job }: CareersApplyFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const name = (form.get("name") as string) || "";
    const email = (form.get("email") as string) || "";
    const resumeText = (form.get("resumeText") as string) || "";
    const linkedinUrl = (form.get("linkedinUrl") as string) || "";

    const answers: { questionId: string; answerText: string }[] = [];
    job.applicationTemplate?.questions.forEach((q) => {
      const key = `q_${q.id}`;
      const value = form.get(key);
      if (value != null && String(value).trim().length > 0) {
        answers.push({
          questionId: q.id,
          answerText: String(value),
        });
      }
    });

    try {
      const res = await fetch(`${API_URL}/careers/jobs/${job.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": ORG_ID,
        },
        body: JSON.stringify({
          name,
          email,
          resumeText,
          linkedinUrl,
          source: "public_job_board",
          answers,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Failed with status ${res.status}`);
      }

      setDone(true);
    } catch (err: any) {
      console.error("Application submit error", err);
      setError(err?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-emerald-800">
          Application submitted 🎉
        </h2>
        <p className="text-xs text-slate-600">
          Thanks for applying for{" "}
          <span className="font-medium">{job.title}</span>. The team will
          review your application and reach out if it&apos;s a fit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Apply for this role
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          No accounts or passwords. Just share your details and we&apos;ll take
          it from there.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Full name<span className="text-rose-500">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700">
          LinkedIn or portfolio (optional)
        </label>
        <input
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700">
          Resume (paste text or summary)
        </label>
        <textarea
          name="resumeText"
          rows={5}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="Paste your resume here or share a quick summary of your experience."
        />
      </div>

      {/* Additional questions */}
      {job.applicationTemplate?.questions?.length ? (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-semibold text-slate-900">
            Additional questions
          </h3>
          {job.applicationTemplate.questions.map((q) => (
            <div key={q.id} className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                {q.label}
                {q.required && <span className="text-rose-500"> *</span>}
              </label>
              <input
                name={`q_${q.id}`}
                required={q.required}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {q.helpText && (
                <p className="text-[11px] text-slate-500">{q.helpText}</p>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
