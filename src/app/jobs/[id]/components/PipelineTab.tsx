// src/app/jobs/[id]/components/PipelineTab.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import api from "@/lib/api";

type Job = {
  id: string;
  title: string;
};

type Stage = {
  id: string;
  name: string;
  order: number;
};

type Candidate = {
  id: string;
  name?: string | null;
  email?: string | null;
  stageId: string;
  matchScore?: number | null;
  source?: string | null;
  appliedAt?: string | null;
  title?: string | null;
};

type FilterState = {
  search: string;
  minScore: number | null;
  aiOnly: boolean;
};

type Props = {
  jobId: string;
  job?: Job;
  stages?: Stage[];
  candidates?: Candidate[];
  onReload?: () => void;
  isEmployee?: boolean;
};

export function PipelineTab({
  jobId,
  job: jobProp,
  stages: stagesProp,
  candidates: candidatesProp,
  onReload,
  isEmployee = false,
}: Props) {
  const [pipelineJob, setPipelineJob] = useState<Job | undefined>(jobProp);
  const [pipelineStages, setPipelineStages] = useState<Stage[] | undefined>(
    stagesProp
  );
  const [pipelineCandidates, setPipelineCandidates] = useState<
    Candidate[] | undefined
  >(candidatesProp);
  const [loadingFetch, setLoadingFetch] = useState(
    !jobProp || !stagesProp || !candidatesProp
  );
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fallback fetch if data not provided
  useMemo(() => {
    setPipelineJob(jobProp);
    setPipelineStages(stagesProp);
    setPipelineCandidates(candidatesProp);
  }, [jobProp, stagesProp, candidatesProp]);

  const fetchPipeline = async () => {
    try {
      setLoadingFetch(true);
      setFetchError(null);
      const data = await api.get<{
        job: Job;
        stages: Stage[];
        candidates: Candidate[];
      }>(`/jobs/${jobId}/pipeline`);
      if (data) {
        setPipelineJob(data.job);
        setPipelineStages(data.stages);
        setPipelineCandidates(data.candidates);
      }
    } catch (err: any) {
      console.error("[PipelineTab] fetch failed", err);
      setFetchError(err?.message || "Failed to load pipeline");
    } finally {
      setLoadingFetch(false);
    }
  };

  // Auto-fetch if props missing
  useMemo(() => {
    if (!jobProp || !stagesProp || !candidatesProp) {
      void fetchPipeline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const job = pipelineJob;
  const stages = pipelineStages ?? [];
  const candidates = pipelineCandidates ?? [];

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    minScore: null,
    aiOnly: false,
  });
  const [movingId, setMovingId] = useState<string | null>(null);

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages]
  );

  const filteredByStage = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minScore = filters.minScore;
    const aiOnly = filters.aiOnly;

    const map: Record<string, Candidate[]> = {};
    sortedStages.forEach((s) => {
      map[s.id] = [];
    });

    candidates.forEach((cand) => {
      // stage filter bucket
      if (!map[cand.stageId]) map[cand.stageId] = [];

      // search filter
      if (search) {
        const name = (cand.name || "").toLowerCase();
        const email = (cand.email || "").toLowerCase();
        if (!name.includes(search) && !email.includes(search)) return;
      }

      // AI-only filter
      if (aiOnly && cand.matchScore == null) return;

      // min score
      if (
        minScore != null &&
        typeof cand.matchScore === "number" &&
        cand.matchScore < minScore
      ) {
        return;
      }

      map[cand.stageId].push(cand);
    });

    // Sort candidates per stage by appliedAt or name
    Object.keys(map).forEach((stageId) => {
      map[stageId] = map[stageId].sort((a, b) => {
        if (a.appliedAt && b.appliedAt) {
          return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
        }
        const an = (a.name || "").toLowerCase();
        const bn = (b.name || "").toLowerCase();
        return an.localeCompare(bn);
      });
    });

    return map;
  }, [candidates, filters, sortedStages]);

  const totalVisible = useMemo(
    () =>
      Object.values(filteredByStage).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
    [filteredByStage]
  );

  const handleStageChange = async (candidateId: string, newStageId: string) => {
    if (isEmployee) return;
    try {
      setMovingId(candidateId);
      await api.patch(`/candidates/${candidateId}`, { stageId: newStageId });
      if (onReload) {
        await onReload();
      } else {
        await fetchPipeline();
      }
    } catch (err) {
      console.error("[Pipeline] stage change failed", err);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Pipeline {job ? `· ${job.title}` : ""}
          </h2>
          <p className="text-xs text-slate-500">
            Drag/drop not enabled; use stage controls to move candidates. AI match scores help you prioritize quickly.
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

      {/* Loading/error */}
      {loadingFetch && !job && (
        <div className="space-y-3">
          <div className="h-12 rounded-lg bg-slate-100" />
          <div className="h-48 rounded-lg bg-slate-100" />
        </div>
      )}
      {fetchError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {fetchError}
          <div className="mt-2">
            <button
              onClick={fetchPipeline}
              className="rounded-md border border-amber-200 bg-white px-3 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-50"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Columns */}
      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-full gap-4">
          {sortedStages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              candidates={filteredByStage[stage.id] ?? []}
              jobId={jobId}
              allStages={sortedStages}
              onStageChange={handleStageChange}
              isEmployee={isEmployee}
              movingId={movingId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               FILTERS & UTILS                               */
/* -------------------------------------------------------------------------- */

type FiltersBarProps = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
};

function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs shadow-sm">
      {/* Search */}
      <div className="flex min-w-[220px] flex-1 items-center gap-2">
        <span className="text-[11px] font-medium text-slate-500">
          Search
        </span>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={filters.search}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value })
          }
          className="h-8 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-100"
        />
      </div>

      {/* Min score */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-slate-500">
          Min AI match
        </span>
        <select
          className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-100"
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

/* -------------------------------------------------------------------------- */
/*                              COLUMN / CARD UI                               */
/* -------------------------------------------------------------------------- */

function StageColumn({
  stage,
  candidates,
  jobId,
  allStages,
  onStageChange,
  isEmployee,
  movingId,
}: {
  stage: Stage;
  candidates: Candidate[];
  jobId: string;
  allStages: Stage[];
  onStageChange: (candidateId: string, stageId: string) => void;
  isEmployee: boolean;
  movingId: string | null;
}) {
  const count = candidates.length;

  return (
    <div className="flex w-[280px] flex-shrink-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Column header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold text-slate-900">
              {stage.name}
            </h3>
          </div>
          <div className="inline-flex h-6 items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-medium text-slate-600">
            {count}
          </div>
        </div>
        <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
          <div className="h-1 w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
        </div>
      </div>

      {/* Cards */}
      <div className="flex max-h-[520px] flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 pt-1">
        {count === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-[11px] text-slate-400">
            No candidates in this stage yet.
          </div>
        )}

        {candidates.map((cand) => (
          <CandidateCard
            key={cand.id}
            candidate={cand}
            jobId={jobId}
            allStages={allStages}
            currentStageId={stage.id}
            onStageChange={onStageChange}
            isEmployee={isEmployee}
            movingId={movingId}
          />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  jobId,
  allStages,
  currentStageId,
  onStageChange,
  isEmployee,
  movingId,
}: {
  candidate: Candidate;
  jobId: string;
  allStages: Stage[];
  currentStageId: string;
  onStageChange: (candidateId: string, stageId: string) => void;
  isEmployee: boolean;
  movingId: string | null;
}) {
  const router = useRouter();
  const created = candidate.appliedAt ? new Date(candidate.appliedAt) : null;
  const now = new Date();
  const diffDays =
    created != null
      ? Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
      : null;
  const appliedLabel =
    diffDays == null
      ? ""
      : diffDays === 0
      ? "Applied today"
      : diffDays === 1
      ? "Applied 1 day ago"
      : `Applied ${diffDays} days ago`;

  const initials = getInitials(candidate.name);
  const sourceLabel = candidate.source;
  const sourceClass = getSourceBadgeClass(sourceLabel);

  const handleClick = () => {
    if (!candidate.id) return;
    const params = new URLSearchParams();
    params.set("source", "pipeline");
    params.set("jobId", jobId);
    if (typeof candidate.matchScore === "number") {
      params.set("matchScore", String(Math.round(candidate.matchScore)));
    }
    router.push(
      `/candidates/${encodeURIComponent(candidate.id)}?${params.toString()}`
    );
  };

  const handleMove = (stageId: string) => {
    if (stageId === currentStageId) return;
    onStageChange(candidate.id, stageId);
  };

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-100 bg-white px-3.5 py-3 text-left text-xs shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      {/* Top row: avatar + name/email */}
      <button type="button" onClick={handleClick} className="w-full text-left">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-slate-900">
              {candidate.name || "Unnamed candidate"}
            </div>
            {candidate.email && (
              <div className="truncate text-[11px] text-slate-500">
                {candidate.email}
              </div>
            )}
            {candidate.title && (
              <div className="truncate text-[11px] text-slate-500">
                {candidate.title}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Middle row: source + (optional) AI match */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {sourceLabel && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${sourceClass}`}
          >
            {sourceLabel}
          </span>
        )}
        {typeof candidate.matchScore === "number" && (
          <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 group-hover:border-indigo-100 group-hover:bg-indigo-50 group-hover:text-indigo-700">
            AI match {Math.round(candidate.matchScore)}%
          </span>
        )}
      </div>

      {/* Bottom row: applied date + stage select */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock className="h-3 w-3" />
          <span>{appliedLabel}</span>
        </div>

        {!isEmployee && (
          <select
            value={currentStageId}
            onChange={(e) => handleMove(e.target.value)}
            disabled={movingId === candidate.id}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {allStages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function getSourceBadgeClass(source: string | null | undefined): string {
  if (!source) return "bg-slate-50 text-slate-600 border border-slate-100";

  const key = source.toLowerCase();
  if (key.includes("linkedin")) {
    return "bg-sky-50 text-sky-700 border border-sky-100";
  }
  if (key.includes("referral")) {
    return "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100";
  }
  if (key.includes("internal")) {
    return "bg-indigo-50 text-indigo-700 border border-indigo-100";
  }
  if (key.includes("indeed")) {
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  }
  return "bg-slate-50 text-slate-600 border border-slate-100";
}
