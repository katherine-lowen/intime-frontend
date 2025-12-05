"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

type PipelineApplication = {
  applicationId: string;
  createdAt: string;
  candidateId: string;
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

type FilterState = {
  search: string;
  minScore: number | null;
  aiOnly: boolean;
};

export function PipelineTab({ jobId }: { jobId: string }) {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    minScore: null,
    aiOnly: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchPipeline() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/jobs/${jobId}/pipeline`, {
          headers: {
            // if you later add auth proxy headers, inject x-user-* here
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Failed to load pipeline (${res.status}): ${text}`,
          );
        }

        const json = (await res.json()) as PipelineResponse;

        if (!cancelled) {
          setData(json);
        }
      } catch (err: any) {
        console.error("[PipelineTab] error loading pipeline:", err);
        if (!cancelled) {
          setError(err?.message || "Failed to load pipeline");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPipeline();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const filteredStages = useMemo(() => {
    if (!data) return [];

    const search = filters.search.trim().toLowerCase();
    const minScore = filters.minScore;
    const aiOnly = filters.aiOnly;

    return (data.stages ?? []).map((stage) => {
      const apps = stage.applications.filter((app) => {
        // Search filter
        if (search) {
          const name = (app.candidateName || "").toLowerCase();
          const email = (app.candidateEmail || "").toLowerCase();
          if (!name.includes(search) && !email.includes(search)) {
            return false;
          }
        }

        // AI-only filter
        if (aiOnly && app.matchScore == null) {
          return false;
        }

        // Min score filter
        if (
          minScore != null &&
          typeof app.matchScore === "number" &&
          app.matchScore < minScore
        ) {
          return false;
        }

        return true;
      });

      return { ...stage, applications: apps };
    });
  }, [data, filters]);

  const totalVisible = useMemo(() => {
    return filteredStages.reduce(
      (sum, stage) => sum + stage.applications.length,
      0,
    );
  }, [filteredStages]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500">
        Loading pipeline…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500">
        No pipeline data available.
      </div>
    );
  }

  const stages = filteredStages;

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Pipeline board
          </h2>
          <p className="text-xs text-slate-500">
            Candidates grouped by stage for this job. AI-matched candidates
            are tagged with their match score so you can triage faster.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            {totalVisible}{" "}
            {totalVisible === 1 ? "candidate" : "candidates"} in view
          </span>
        </div>
      </div>

      {/* Filters */}
      <FiltersBar filters={filters} onChange={setFilters} />

      {/* Columns */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {stages.map((stage) => (
          <StageColumn key={stage.id} stage={stage} jobId={jobId} />
        ))}
      </div>
    </div>
  );
}

type FiltersBarProps = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
};

function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-3 text-xs shadow-sm">
      {/* Search */}
      <div className="flex min-w-[180px] flex-1 items-center gap-2">
        <span className="text-[11px] font-medium text-slate-500">
          Search
        </span>
        <input
          type="text"
          placeholder="Name or email…"
          value={filters.search}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value })
          }
          className="h-7 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-100"
        />
      </div>

      {/* Min score */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-slate-500">
          Min AI match
        </span>
        <select
          className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-100"
          value={filters.minScore ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange({
              ...filters,
              minScore: v === "" ? null : Number(v),
            });
          }}
        >
          <option value="">Any</option>
          <option value="50">50%+</option>
          <option value="60">60%+</option>
          <option value="70">70%+</option>
          <option value="80">80%+</option>
          <option value="90">90%+</option>
        </select>
      </div>

      {/* AI-only */}
      <label className="inline-flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          checked={filters.aiOnly}
          onChange={(e) =>
            onChange({ ...filters, aiOnly: e.target.checked })
          }
        />
        <span className="text-[11px] text-slate-600">
          AI-scored only
        </span>
      </label>
    </div>
  );
}

function StageColumn({
  stage,
  jobId,
}: {
  stage: PipelineStage;
  jobId: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-slate-800">
          {stage.name}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {stage.applications.length}{" "}
          {stage.applications.length === 1
            ? "candidate"
            : "candidates"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {stage.applications.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-2 py-3 text-center text-[11px] text-slate-400">
            No candidates in this stage.
          </div>
        )}

        {stage.applications.map((app) => (
          <CandidateCard
            key={app.applicationId}
            app={app}
            jobId={jobId}
          />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({
  app,
  jobId,
}: {
  app: PipelineApplication;
  jobId: string;
}) {
  const router = useRouter();

  const created = new Date(app.createdAt);
  const createdLabel = created.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const matchScoreLabel =
    typeof app.matchScore === "number"
      ? `${Math.round(app.matchScore)}%`
      : null;

  const aiScoreTier =
    typeof app.matchScore === "number"
      ? app.matchScore >= 80
        ? "high"
        : app.matchScore >= 60
        ? "medium"
        : "low"
      : null;

  const handleClick = () => {
    if (!app.candidateId) return;

    const params = new URLSearchParams();
    params.set("source", "ai-pipeline");
    params.set("jobId", jobId);
    if (typeof app.matchScore === "number") {
      params.set("matchScore", String(Math.round(app.matchScore)));
    }

    router.push(
      `/candidates/${encodeURIComponent(app.candidateId)}?${params.toString()}`,
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-left text-xs shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/70 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="truncate text-xs font-semibold text-slate-900">
            {app.candidateName || "Unnamed candidate"}
          </div>
          {app.candidateEmail && (
            <div className="truncate text-[11px] text-slate-500">
              {app.candidateEmail}
            </div>
          )}
          {app.candidateStage && (
            <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-slate-400">
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{app.candidateStage}</span>
            </div>
          )}
        </div>

        {matchScoreLabel && aiScoreTier && (
          <div
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
              aiScoreTier === "high" &&
                "bg-emerald-50 text-emerald-700 border border-emerald-100",
              aiScoreTier === "medium" &&
                "bg-amber-50 text-amber-700 border border-amber-100",
              aiScoreTier === "low" &&
                "bg-slate-50 text-slate-600 border border-slate-100",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            AI match&nbsp;{matchScoreLabel}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span>
          Added {createdLabel}
          {app.matchScore != null && " · AI"}
        </span>
      </div>
    </button>
  );
}
