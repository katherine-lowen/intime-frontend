"use client";

import { useState, type FormEvent } from "react";

type MatchResult = {
  matchScore: number;
  summary: string;
  topStrengths: string[];
  risksOrGaps: string[];
  suggestedNextStep: string;
};

export default function AiResumeMatch() {
  const [jobDescription, setJobDescription] = useState("");
  const [candidateNotes, setCandidateNotes] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-resume-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, candidateNotes }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const json = (await res.json()) as MatchResult;
      setResult(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const disabled =
    loading || !jobDescription.trim() || !candidateNotes.trim();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Resume Match
        </h1>
        <p className="text-sm text-neutral-600">
          Paste a job description and candidate summary. Intime&apos;s AI will
          score fit, highlight strengths and risks, and recommend a next step.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-2"
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-800">
            Job description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[220px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="Paste the role description, responsibilities, and requirements..."
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-800">
            Candidate notes / resume summary
          </label>
          <textarea
            value={candidateNotes}
            onChange={(e) => setCandidateNotes(e.target.value)}
            className="min-h-[220px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="Paste your interview notes, resume highlights, key projects, metrics..."
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            We never store this content long-term — it&apos;s used only to score
            this candidate against this role.
          </p>
          <button
            type="submit"
            disabled={disabled}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Scoring…" : "Score candidate →"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Match score
              </p>
              <p className="text-3xl font-semibold">
                {Math.round(result.matchScore)}%
              </p>
            </div>
            <div className="flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-3 text-xs font-medium text-neutral-700">
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
              {result.suggestedNextStep || "Recommendation available"}
            </div>
          </div>

          {result.summary && (
            <p className="text-sm text-neutral-700">{result.summary}</p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {Array.isArray(result.topStrengths) &&
              result.topStrengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Top strengths
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-neutral-800">
                    {result.topStrengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded-lg bg-neutral-50 px-3 py-1.5"
                      >
                        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {Array.isArray(result.risksOrGaps) &&
              result.risksOrGaps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Risks / gaps
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-neutral-800">
                    {result.risksOrGaps.map((s, i) => (
                      <li
                        key={i}
                        className="flex gap-2 rounded-lg bg-neutral-50 px-3 py-1.5"
                      >
                        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </section>
      )}
    </div>
  );
}
