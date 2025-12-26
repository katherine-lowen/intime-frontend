// src/app/org/[orgSlug]/candidates/[candidateId]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { orgHref } from "@/lib/org-base";

type Candidate = {
  id: string;
  name?: string | null;
  email?: string | null;
  stage?: string | null;
  resumeUrl?: string | null;
  coverLetterUrl?: string | null;
  job?: { id: string; title?: string | null } | null;
  jobId?: string | null;
  createdAt?: string | null;
  [key: string]: any;
};

export default function OrgCandidateDetailPage() {
  const params = useParams() as { orgSlug?: string; candidateId?: string } | null;

  // ✅ fix: params can be null, so extract safely
  const candidateId = useMemo(() => params?.candidateId ?? "", [params]);

  const { role, loading: orgLoading } = useCurrentOrg();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!candidateId) {
        setLoading(false);
        setCandidate(null);
        return;
      }

      setLoading(true);
      setErr(null);

      try {
        const data = await api.get<Candidate>(`/candidates/${candidateId}`);
        if (!cancelled) setCandidate(data ?? null);
      } catch (e: any) {
        console.error("[candidate] load failed", e);
        if (!cancelled) setErr(e?.message || "Failed to load candidate.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  return (
    <AuthGate>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Hiring · Candidate</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Candidate details
            </h1>
          </div>

          <Link
            href={orgHref("/candidates")}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to candidates
          </Link>
        </div>

        {orgLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading…
          </div>
        ) : !role ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            No org role found.
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading candidate…
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {err}
          </div>
        ) : !candidate ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Candidate not found.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-slate-900">
                {candidate.name || candidate.email || "Candidate"}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {candidate.email || "—"}
                {candidate.stage ? ` • ${candidate.stage}` : ""}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {candidate.resumeUrl ? (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Resume ↗
                  </a>
                ) : null}
                {candidate.coverLetterUrl ? (
                  <a
                    href={candidate.coverLetterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cover letter ↗
                  </a>
                ) : null}
                {candidate.job?.id ? (
                  <Link
                    href={orgHref(`/jobs/${candidate.job.id}/pipeline`)}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    View pipeline →
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Raw</div>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-[11px] text-slate-200">
                {JSON.stringify(candidate, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </AuthGate>
  );
}
