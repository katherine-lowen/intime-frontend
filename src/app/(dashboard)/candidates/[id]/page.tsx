// src/app/(dashboard)/candidates/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type Candidate = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  stage?: string | null;
  jobId?: string | null;
  createdAt?: string;
  resumeText?: string | null;
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

  // Incoming match context from pipeline / AI resume match
  const source = searchParams?.get("source") ?? null;
  const jobIdFromURL = searchParams?.get("jobId") ?? null;
  const matchScore = searchParams?.get("matchScore") ?? null;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch candidate
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.get<Candidate>(`/candidates/${candidateId}`);
        setCandidate(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load candidate.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading candidate…
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="p-8 text-sm text-red-600">
        {error ?? "Candidate not found."}
      </div>
    );
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 p-8 space-y-6">
        {/* AI MATCH BANNER */}
        {source === "ai-pipeline" && matchScore && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
              AI Resume Match
            </div>
            <p className="mt-1 text-sm text-indigo-900">
              This candidate was added from AI Resume Match for job{" "}
              <span className="font-mono">{jobIdFromURL}</span>.
            </p>
            <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow">
              Match Score: {matchScore}%
            </div>
          </div>
        )}

        {/* HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            {candidate.name || "Unnamed Candidate"}
          </h1>

          <div className="mt-2 text-sm text-slate-600">
            {candidate.email && <div>Email: {candidate.email}</div>}
            {candidate.phone && <div>Phone: {candidate.phone}</div>}
            {candidate.stage && (
              <div className="mt-1">
                Stage:{" "}
                <span className="font-medium text-slate-800">
                  {candidate.stage}
                </span>
              </div>
            )}
            {candidate.jobId && (
              <div className="mt-1">Job: {candidate.jobId}</div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => router.back()}
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back
            </button>
          </div>
        </section>

        {/* RESUME / NOTES */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Resume Text (Extracted)
          </h2>
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700">
            {candidate.resumeText || "No resume text available."}
          </pre>
        </section>

        {/* Placeholder for future panels */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            Timeline (coming soon)
          </h2>
          <p className="text-xs text-slate-500">
            Unified events, interviews, communication logs, AI insights…
          </p>
        </section>
      </main>
    </AuthGate>
  );
}
