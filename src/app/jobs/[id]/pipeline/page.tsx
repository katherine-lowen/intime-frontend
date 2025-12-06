// src/app/jobs/[id]/components/PipelineTab.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type PipelineTabProps = {
  jobId: string;
};

type PipelineApplication = {
  applicationId: string;
  createdAt: string;
  candidateId: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  candidateStage: string | null;
  matchScore: number | null;
};

type PipelineStage = {
  id: string;
  name: string;
  order: number;
  applications: PipelineApplication[];
};

type PipelineResponse = {
  jobId: string;
  title: string;
  stages: PipelineStage[];
};

export function PipelineTab({ jobId }: PipelineTabProps) {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function loadPipeline() {
      setLoading(true);
      setError(null);

      try {
        // 🔹 Your `api` client returns the JSON directly (NOT axios response)
        const pipeline = await api.get<PipelineResponse>(`/jobs/${jobId}/pipeline`);

        if (!cancelled) {
          setData(pipeline);
        }
      } catch (err) {
        console.error("[PipelineTab] Pipeline load error:", err);
        if (!cancelled) {
          setError("Failed to load pipeline.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPipeline();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // ---------- UI STATES ----------

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
        Loading pipeline…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!data || data.stages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
        No pipeline stages found for this job.
      </div>
    );
  }

  // ---------- PIPELINE BOARD ----------

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-full gap-4">
        {data.stages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((stage) => (
            <div
              key={stage.id}
              className="flex w-72 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              {/* Stage Header */}
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {stage.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {stage.applications.length}{" "}
                  {stage.applications.length === 1 ? "candidate" : "candidates"}
                </div>
              </div>

              {/* Applications List */}
              <div className="flex flex-col gap-2">
                {stage.applications.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center text-[11px] text-slate-400">
                    No candidates here yet
                  </div>
                )}

                {stage.applications.map((app) => (
                  <div
                    key={app.applicationId}
                    className="group rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-xs hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-slate-900">
                          {app.candidateName || "Unnamed candidate"}
                        </div>
                        {app.candidateEmail && (
                          <div className="text-xs text-slate-500">{app.candidateEmail}</div>
                        )}
                      </div>

                      {typeof app.matchScore === "number" && (
                        <div className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                          {Math.round(app.matchScore * 100)}%
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {app.candidateStage && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                          {app.candidateStage}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
