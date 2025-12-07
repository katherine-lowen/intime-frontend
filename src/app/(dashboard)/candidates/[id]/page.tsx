// src/app/(dashboard)/candidates/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

// ---- Types for enriched candidate profile ------------------------------

type AiMatch = {
  matchScore: number;
  summary: string;
  strengths: string[];
  risks: string[];
};

type CandidateNote = {
  id: string;
  text: string;
  authorName?: string | null;
  createdAt?: string;
};

type ApplicationQuestion = {
  id: string;
  label: string;
  helpText?: string | null;
};

type ApplicationAnswer = {
  id: string;
  answerText?: string | null;
  question?: ApplicationQuestion | null;
};

type Event = {
  id: string;
  type?: string | null;
  source?: string | null;
  summary?: string | null;
  createdAt?: string;
};

type JobLite = {
  id: string;
  title: string;
  department?: string | null;
};

// This matches your Prisma Candidate model + optional relations.
// Backend can gradually start returning these; UI will cope if they’re missing.
type Candidate = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  stage?: string | null;
  jobId?: string | null;
  createdAt?: string;
  resumeText?: string | null;
  linkedinUrl?: string | null;
  source?: string | null;

  // Optional relations
  job?: JobLite | null;
  aiMatch?: AiMatch | null;
  candidateNotes?: CandidateNote[];
  applicationAnswers?: ApplicationAnswer[];
  events?: Event[];
};

export default function CandidatePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const candidateId = (params as { id?: string })?.id;

  if (!candidateId) {
    return (
      <div className="p-8 text-sm text-red-600">
        Missing candidate id in the URL.
      </div>
    );
  }

  // Incoming context from pipeline / AI resume match
  const sourceParam = searchParams?.get("source") ?? null;
  const jobIdFromURL = searchParams?.get("jobId") ?? null;
  const matchScoreFromURL = searchParams?.get("matchScore") ?? null;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch candidate from backend
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<Candidate>(`/candidates/${candidateId}`);

        // Narrow out undefined
        if (!data) {
          setCandidate(null);
          setError("Candidate not found.");
          return;
        }

        setCandidate(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load candidate.");
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [candidateId]);

  const effectiveAiMatch: AiMatch | null = useMemo(() => {
    if (candidate?.aiMatch) return candidate.aiMatch;

    // Fallback: if we were navigated from AI pipeline with a matchScore in the URL,
    // we at least show that in the header chip.
    if (matchScoreFromURL) {
      const score = Number(matchScoreFromURL);
      if (!Number.isNaN(score)) {
        return {
          matchScore: score,
          summary:
            "AI resume match was triggered for this candidate. Connect this candidate to the job to see a full AI summary here.",
          strengths: [],
          risks: [],
        };
      }
    }

    return null;
  }, [candidate?.aiMatch, matchScoreFromURL]);

  const timelineItems = useMemo(() => {
    const events = (candidate?.events ?? []).map((e) => ({
      kind: "event" as const,
      id: `event-${e.id}`,
      createdAt: e.createdAt ?? "",
      label: e.summary || e.type || "Event",
      meta: e.source || "",
    }));

    const notes = (candidate?.candidateNotes ?? []).map((n) => ({
      kind: "note" as const,
      id: `note-${n.id}`,
      createdAt: n.createdAt ?? "",
      label: n.text,
      meta: n.authorName || "Recruiter note",
    }));

    const all = [...events, ...notes];

    return all.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [candidate]);

  if (loading) {
    return (
      <AuthGate>
        <div className="p-8 text-sm text-slate-500">Loading candidate…</div>
      </AuthGate>
    );
  }

  if (error || !candidate) {
    return (
      <AuthGate>
        <div className="p-8 text-sm text-red-600">
          {error ?? "Candidate not found."}
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          {/* AI origin banner if we came from AI pipeline */}
          {sourceParam === "ai-pipeline" && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
                AI resume match
              </div>
              <p className="mt-1 text-xs text-indigo-900">
                This candidate was added from AI Resume Match
                {jobIdFromURL && (
                  <>
                    {" "}
                    for job{" "}
                    <span className="font-mono">{jobIdFromURL}</span>
                  </>
                )}
                .
              </p>
            </div>
          )}

          {/* HEADER / SUMMARY */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {candidate.name || "Unnamed candidate"}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  {candidate.email && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                      {candidate.email}
                    </span>
                  )}
                  {candidate.phone && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                      {candidate.phone}
                    </span>
                  )}
                  {candidate.stage && (
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
                      Stage: {candidate.stage}
                    </span>
                  )}
                  {candidate.job && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                      {candidate.job.title}
                    </span>
                  )}
                  {!candidate.job && candidate.jobId && (
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                      Job ID: {candidate.jobId}
                    </span>
                  )}
                  {candidate.source && (
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-slate-500">
                      Source: {candidate.source}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {effectiveAiMatch && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-slate-50">
                    <span className="opacity-80">AI match</span>
                    <span className="text-sm font-semibold">
                      {Math.round(effectiveAiMatch.matchScore)}%
                    </span>
                  </div>
                )}
                <button
                  onClick={() => router.back()}
                  className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                >
                  ← Back to previous view
                </button>
              </div>
            </div>
          </section>

          {/* 2-column layout: left = profile/app, right = AI insights */}
          <section className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Profile card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Candidate profile
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Core contact information and links.
                </p>

                <div className="mt-4 grid gap-3 text-xs text-slate-700">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium">
                      {candidate.email || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium">
                      {candidate.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">LinkedIn</span>
                    {candidate.linkedinUrl ? (
                      <a
                        href={candidate.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        View profile
                      </a>
                    ) : (
                      <span className="font-medium text-slate-400">
                        Not provided
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Created</span>
                    <span className="font-medium">
                      {candidate.createdAt
                        ? new Date(candidate.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Application questionnaire */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Application questionnaire
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Questions and answers submitted with their application.
                </p>

                <div className="mt-4 space-y-3">
                  {(candidate.applicationAnswers ?? []).length === 0 && (
                    <p className="text-xs text-slate-400">
                      No application questions answered for this candidate yet.
                    </p>
                  )}

                  {(candidate.applicationAnswers ?? []).map((answer) => (
                    <div
                      key={answer.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-xs"
                    >
                      <div className="font-medium text-slate-900">
                        {answer.question?.label || "Question"}
                      </div>
                      {answer.question?.helpText && (
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {answer.question.helpText}
                        </div>
                      )}
                      <div className="mt-2 text-slate-700">
                        {answer.answerText || (
                          <span className="italic text-slate-400">
                            No answer provided.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: AI insights + quick summary */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  AI insights
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Snapshot from AI resume match for this candidate.
                </p>

                {!effectiveAiMatch && (
                  <p className="mt-4 text-xs text-slate-400">
                    No AI match has been recorded for this candidate yet.
                    Run AI resume match from the job or candidate panel to
                    see insights here.
                  </p>
                )}

                {effectiveAiMatch && (
                  <div className="mt-4 space-y-4 text-xs text-slate-700">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Summary
                      </div>
                      <p className="mt-1 text-sm leading-relaxed">
                        {effectiveAiMatch.summary}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                          Top strengths
                        </div>
                        <ul className="mt-2 space-y-1.5">
                          {(effectiveAiMatch.strengths ?? []).length ===
                            0 && (
                            <li className="text-[11px] text-slate-400">
                              None recorded yet.
                            </li>
                          )}
                          {(effectiveAiMatch.strengths ?? []).map((s, i) => (
                            <li key={i} className="flex gap-2 text-xs">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600">
                          Risks / gaps
                        </div>
                        <ul className="mt-2 space-y-1.5">
                          {(effectiveAiMatch.risks ?? []).length === 0 && (
                            <li className="text-[11px] text-slate-400">
                              None recorded yet.
                            </li>
                          )}
                          {(effectiveAiMatch.risks ?? []).map((r, i) => (
                            <li key={i} className="flex gap-2 text-xs">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Activity timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Activity & timeline
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Interviews, status changes, and recruiter notes.
                </p>

                {timelineItems.length === 0 && (
                  <p className="mt-4 text-xs text-slate-400">
                    No events or notes recorded yet.
                  </p>
                )}

                <ol className="mt-4 space-y-3">
                  {timelineItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 text-xs text-slate-700"
                    >
                      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-slate-300" />
                      <div className="space-y-0.5">
                        <div className="font-medium">{item.label}</div>
                        {item.meta && (
                          <div className="text-[11px] text-slate-500">
                            {item.meta}
                          </div>
                        )}
                        {item.createdAt && (
                          <div className="text-[11px] text-slate-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* Resume section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Resume (extracted text)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Parsed resume content used for AI matching and search. The
              original file is stored safely in your Supabase bucket.
            </p>

            <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700">
              {candidate.resumeText || "No resume text available."}
            </pre>
          </section>
        </div>
      </main>
    </AuthGate>
  );
}
