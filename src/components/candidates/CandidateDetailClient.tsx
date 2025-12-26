"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import { AiSummaryCard } from "./AiSummaryCard";

type Stage = { id: string; name: string; order: number };

export type CandidateDetail = {
  id: string;
  publicId: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  source?: string | null;
  appliedAt: string;
  currentStage: string;
  job: {
    id: string;
    title: string;
    location?: string | null;
    department?: string | null;
  } | null;
  attachments: {
    id: string;
    kind: "RESUME" | "COVER_LETTER" | "OTHER";
    url: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }[];
  parsedResume?: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    yearsOfExperience: number | null;
    currentTitle: string | null;
    currentCompany: string | null;
    skills: string[];
    seniority:
      | "Junior"
      | "Mid"
      | "Senior"
      | "Lead"
      | "Director"
      | "VP"
      | "CLevel"
      | null;
    summary: string | null;
  } | null;
  answers?: {
    id: string;
    questionId: string;
    questionLabel: string;
    answerText: string | null;
  }[];
  candidateNotes?: {
    id: string;
    text: string;
    authorName?: string | null;
    createdAt?: string;
  }[];
  events?: {
    id: string;
    type?: string | null;
    source?: string | null;
    summary?: string | null;
    createdAt?: string;
  }[];
};

export function CandidateDetailClient({
  candidateId,
  jobId,
}: {
  candidateId: string;
  jobId?: string | null;
}) {
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageSelection, setStageSelection] = useState<string>("");
  const [savingStage, setSavingStage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const detailPath = jobId
          ? `/jobs/${jobId}/candidates/${candidateId}`
          : `/candidates/${candidateId}`;
        const data = await api.get<CandidateDetail>(detailPath);
        if (!cancelled) {
          setCandidate(data ?? null);
          setStageSelection(data?.currentStage || "");
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[candidate detail] fetch failed", err);
          setError(err?.message || "Unable to load candidate.");
          setCandidate(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [candidateId, jobId]);

  useEffect(() => {
    let cancelled = false;
    async function loadStages() {
      if (!jobId) return;
      try {
        const pipeline = await api.get<{ stages: Stage[] }>(
          `/jobs/${jobId}/pipeline`
        );
        if (!cancelled && pipeline?.stages) {
          setStages(pipeline.stages);
        }
      } catch (err) {
        console.warn("[candidate detail] failed to load stages", err);
      }
    }
    void loadStages();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const resume = useMemo(() => {
    if (!candidate?.attachments) return null;
    return (
      candidate.attachments
        .filter((a) => a.kind === "RESUME")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0] || null
    );
  }, [candidate]);

  const coverLetter = useMemo(() => {
    if (!candidate?.attachments) return null;
    return (
      candidate.attachments
        .filter((a) => a.kind === "COVER_LETTER")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0] || null
    );
  }, [candidate]);

  const stageOptions = useMemo(
    () => stages.sort((a, b) => a.order - b.order),
    [stages]
  );

  const handleStageChange = async () => {
    if (!candidate) return;
    if (!stageSelection || savingStage) return;
    try {
      setSavingStage(true);
      await api.patch(`/candidates/${candidate.id}`, {
        stageId: stageSelection,
      });
      const updated = await api.get<CandidateDetail>(
        jobId
          ? `/jobs/${jobId}/candidates/${candidate.id}`
          : `/candidates/${candidate.id}`
      );
      setCandidate(updated ?? null);
    } catch (err: any) {
      console.error("[candidate detail] stage update failed", err);
      setError("Failed to update stage.");
    } finally {
      setSavingStage(false);
    }
  };

  if (loading) {
    return (
      <AuthGate>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          Loading candidate…
        </div>
      </AuthGate>
    );
  }

  if (error || !candidate) {
    return (
      <AuthGate>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          <div className="space-y-3 text-center">
            <p className="text-sm text-slate-700">
              {error ?? "Candidate not found."}
            </p>
            <button
              onClick={() => location.reload()}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Retry
            </button>
          </div>
        </div>
      </AuthGate>
    );
  }

  const answers = candidate.answers ?? [];

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Candidate detail
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {candidate.name || "Unnamed candidate"}
            </h1>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
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
              {candidate.location && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1">
                  {candidate.location}
                </span>
              )}
              {candidate.source && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                  Source: {candidate.source}
                </span>
              )}
            </div>
          </div>
          {candidate.job && (
            <div className="text-right text-sm text-slate-600">
              <div className="font-semibold text-slate-900">
                {candidate.job.title}
              </div>
              <div className="text-xs">
                {[candidate.job.department, candidate.job.location]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <AiSummaryCard
              name={candidate.name || "Candidate"}
              parsed={candidate.parsedResume ?? null}
            />

            {candidate.parsedResume?.skills?.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.parsedResume.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Application questions
              </h3>
              {answers.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  No additional questions answered.
                </p>
              ) : (
                <div className="mt-3 divide-y divide-slate-100">
                  {answers.map((a) => (
                    <div key={a.id} className="py-3">
                      <div className="text-sm font-medium text-slate-700">
                        {a.questionLabel}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {a.answerText || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {candidate.events?.length || candidate.candidateNotes?.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">
                  Activity & timeline
                </h3>
                <ol className="mt-3 space-y-3 text-xs text-slate-700">
                  {(candidate.events ?? []).map((e) => (
                    <li key={e.id} className="flex gap-2">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-slate-300" />
                      <div>
                        <div className="font-medium">{e.summary || e.type || "Event"}</div>
                        {e.source && (
                          <div className="text-[11px] text-slate-500">{e.source}</div>
                        )}
                        {e.createdAt && (
                          <div className="text-[11px] text-slate-400">
                            {new Date(e.createdAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                  {(candidate.candidateNotes ?? []).map((n) => (
                    <li key={n.id} className="flex gap-2">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-300" />
                      <div>
                        <div className="font-medium">{n.text}</div>
                        {n.authorName && (
                          <div className="text-[11px] text-slate-500">
                            {n.authorName}
                          </div>
                        )}
                        {n.createdAt && (
                          <div className="text-[11px] text-slate-400">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Candidate basics
              </h3>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <div>Email: {candidate.email || "—"}</div>
                <div>Phone: {candidate.phone || "—"}</div>
                <div>Location: {candidate.location || "—"}</div>
                <div>Source: {candidate.source || "—"}</div>
                <div>
                  Applied:{" "}
                  {candidate.appliedAt
                    ? new Date(candidate.appliedAt).toLocaleDateString()
                    : "—"}
                </div>
              </div>
              {candidate.job && (
                <div className="mt-4 space-y-1 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">Job</div>
                  <div>{candidate.job.title}</div>
                  <div className="text-xs text-slate-500">
                    {[candidate.job.department, candidate.job.location]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {resume ? (
                  <div className="space-y-1">
                    <a
                      href={resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View resume
                    </a>
                    <div className="text-[11px] text-slate-500">
                      {resume.fileName} ·{" "}
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No resume uploaded.</p>
                )}

                {coverLetter ? (
                  <div className="space-y-1">
                    <a
                      href={coverLetter.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View cover letter
                    </a>
                    <div className="text-[11px] text-slate-500">
                      {coverLetter.fileName} ·{" "}
                      {new Date(coverLetter.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Stage</h3>
              <p className="text-xs text-slate-500">
                Current: {candidate.currentStage || "—"}
              </p>
              {stageOptions.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <select
                    value={stageSelection}
                    onChange={(e) => setStageSelection(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                  >
                    <option value="">Select stage</option>
                    {stageOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleStageChange}
                    disabled={!stageSelection || savingStage}
                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingStage ? "Updating…" : "Update stage"}
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Stages unavailable for this job.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
              <p className="mt-2 text-xs text-slate-500">
                Notes will appear here once backend support is added.
              </p>
            </div>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
