// src/app/hiring/ai-studio/resume-match/page.tsx
"use client";

import React, { FormEvent, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";

type MatchResult = {
  matchScore: number;
  summary: string;
  topStrengths: string[];
  risksOrGaps: string[];
  suggestedNextStep: string;
  resumeUrl?: string | null;
};

export default function AiResumeMatchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  // For “choose current job” / JD prefill
  const [jobDescription, setJobDescription] = useState("");
  const [candidateNotes, setCandidateNotes] = useState("");

  // Simple UX feedback for the “add to pipeline” button
  const [pipelineStatus, setPipelineStatus] = useState<string | null>(null);

  function handleChooseCurrentJob() {
    // TODO: replace this with actual current job from your ATS context
    const mockJob =
      "Senior Full-Stack Engineer\n\nWe're seeking an experienced Full-Stack Engineer to join our growing team. You'll be responsible for building scalable web applications using React, Node.js, and PostgreSQL.\n\nRequirements:\n- 6+ years of full-stack development experience\n- Expert knowledge of React, Node.js, TypeScript\n- Experience with microservices architecture\n- Strong understanding of cloud infrastructure (AWS/GCP)\n- Experience with Kubernetes and container orchestration\n- Leadership experience managing small engineering teams\n- Excellent communication skills";

    setJobDescription(mockJob);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setPipelineStatus(null);
    setLoading(true);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      // Make sure our controlled values are what gets sent
      fd.set("jobDescription", jobDescription);
      fd.set("candidateNotes", candidateNotes);

      const res = await fetch("/api/ai-resume-match", {
        method: "POST",
        body: fd, // multipart/form-data with file + fields
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Request failed: ${res.status}`);
      }

      setResult({
        matchScore: data.matchScore ?? 0,
        summary: data.summary ?? "",
        topStrengths: Array.isArray(data.topStrengths)
          ? data.topStrengths
          : [],
        risksOrGaps: Array.isArray(data.risksOrGaps) ? data.risksOrGaps : [],
        suggestedNextStep: data.suggestedNextStep ?? "",
        resumeUrl: data.resumeUrl ?? null,
      });
    } catch (err: any) {
      console.error("[AI Resume Match] error:", err);
      setError(err?.message || "Failed to generate resume match");
    } finally {
      setLoading(false);
    }
  }

  function handleAddToPipeline() {
    // TODO: wire this to your real “add candidate to pipeline” flow
    setPipelineStatus("Candidate added to pipeline (stubbed).");
  }

  return (
    <AuthGate>
      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        {/* Header / hero */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Intime AI Studio · Resume match
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                AI resume match for hiring
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Paste a job description and either paste candidate notes{" "}
                <span className="font-semibold">or upload a resume PDF</span>.
                Intime will score the match and surface strengths, risks, and a
                suggested next step.
              </p>
            </div>
            <button
              type="button"
              onClick={handleChooseCurrentJob}
              className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Use current job
            </button>
          </div>
        </header>

        {/* Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            encType="multipart/form-data"
          >
            {/* Job description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">
                Job description
              </label>
              <p className="text-xs text-slate-500">
                Paste the live JD you&apos;re hiring against. The model will
                anchor all scoring and recommendations to this.
              </p>
              <textarea
                name="jobDescription"
                required
                rows={6}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Candidate notes / resume */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Candidate notes text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-800">
                    Candidate notes (optional)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    You can also just upload a resume →
                  </span>
                </div>
                <textarea
                  name="candidateNotes"
                  rows={6}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  placeholder="Paste resume text, LinkedIn summary, or your own notes about this candidate..."
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                />
              </div>

              {/* File upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-800">
                  Upload resume file
                </label>
                <p className="text-xs text-slate-500">
                  PDF or plain text works best. We&apos;ll upload it securely to
                  Supabase and auto-extract the text for scoring.
                </p>
                <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.txt"
                    className="text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-slate-800"
                  />
                  <p className="text-[11px] text-slate-500">
                    If both notes and a file are provided, the AI will use{" "}
                    <span className="font-semibold">both</span> sources.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Scoring match…" : "Run AI resume match"}
              </button>
              <p className="text-[11px] text-slate-400">
                We never show this data to candidates. It stays inside Intime.
              </p>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </form>
        </section>

        {/* Result */}
        {result && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Match result
                </h2>
                <p className="text-xs text-slate-500">
                  Generated by Intime AI based on your JD and candidate profile.
                </p>
              </div>
              <div className="flex items-baseline gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-50">
                <span>Match score</span>
                <span className="text-sm font-semibold">
                  {Math.round(result.matchScore)}%
                </span>
              </div>
            </div>

            {result.resumeUrl && (
              <p className="text-[11px] text-slate-500">
                Resume stored at:{" "}
                <a
                  href={result.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  View uploaded file
                </a>
              </p>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Summary
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">
                  {result.summary}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Suggested next step
                </h3>
                <p className="text-sm text-slate-700">
                  {result.suggestedNextStep}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                  Top strengths
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {result.topStrengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                  {result.topStrengths.length === 0 && (
                    <li className="text-xs text-slate-400">
                      No strengths returned.
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
                  Risks / gaps
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {result.risksOrGaps.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>{r}</span>
                    </li>
                  ))}
                  {result.risksOrGaps.length === 0 && (
                    <li className="text-xs text-slate-400">
                      No risks or gaps returned.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAddToPipeline}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Add candidate to pipeline
              </button>
              {pipelineStatus && (
                <p className="text-[11px] text-emerald-600">
                  {pipelineStatus}
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </AuthGate>
  );
}
