// src/app/jobs/[id]/components/PipelineTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

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
  // optional source tag – if your API adds this later we'll show it
  source?: string | null;
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
        const res = await fetch(`${API_URL}/jobs/${jobId}/pipeline`);

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

    if (jobId) fetchPipeline();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const filteredStages = useMemo(() => {
    if (!data) return [];

    const search = filters.search.trim().toLowerCase();
    const minScore = filters.minScore;
    const aiOnly = filters.aiOnly;

    const sortedStages = [...(data.stages ?? [])].sort(
      (a, b) => a.order - b.order,
    );

    return sortedStages.map((stage) => {
      const apps = stage.applications.filter((app) => {
        if (search) {
          const name = (app.candidateName || "").toLowerCase();
          const email = (app.candidateEmail || "").toLowerCase();
          if (!name.includes(search) && !email.includes(search)) {
            return false;
          }
        }

        if (aiOnly && app.matchScore == null) {
          return false;
        }

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

  const totalVisible = useMemo(
    () =>
      filteredStages.reduce(
        (sum, stage) => sum + stage.applications.length,
        0,
      ),
    [filteredStages],
  );

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
    <div className="flex h-full flex-col gap-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Drag-and-drop kanban view of candidates across stages. AI
            match scores help you prioritize quickly.
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
      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-full gap-4">
          {stages.map((stage) => (
            <StageColumn key={stage.id} stage={stage} jobId={jobId} />
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
  jobId,
}: {
  stage: PipelineStage;
  jobId: string;
}) {
  const count = stage.applications.length;

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
        {/* progress underline */}
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
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.max(
    0,
    Math.floor(diffMs / (1000 * 60 * 60 * 24)),
  );

  const appliedLabel =
    diffDays === 0
      ? "Applied today"
      : diffDays === 1
      ? "Applied 1 day ago"
      : `Applied ${diffDays} days ago`;

  const initials = getInitials(app.candidateName);
  const sourceLabel = app.source || guessSourceFromStage(app.candidateStage);
  const sourceClass = getSourceBadgeClass(sourceLabel);

  const handleClick = () => {
    if (!app.candidateId) return;

    const params = new URLSearchParams();
    params.set("source", "pipeline");
    params.set("jobId", jobId);
    if (typeof app.matchScore === "number") {
      params.set("matchScore", String(Math.round(app.matchScore)));
    }

    router.push(
      `/candidates/${encodeURIComponent(
        app.candidateId,
      )}?${params.toString()}`,
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white px-3.5 py-3 text-left text-xs shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
    >
      {/* Top row: avatar + name/email */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-slate-900">
            {app.candidateName || "Unnamed candidate"}
          </div>
          {app.candidateEmail && (
            <div className="truncate text-[11px] text-slate-500">
              {app.candidateEmail}
            </div>
          )}
        </div>
      </div>

      {/* Middle row: source + (optional) AI match */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {sourceLabel && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${sourceClass}`}
          >
            {sourceLabel}
          </span>
        )}
        {typeof app.matchScore === "number" && (
          <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 group-hover:border-indigo-100 group-hover:bg-indigo-50 group-hover:text-indigo-700">
            AI match {Math.round(app.matchScore)}%
          </span>
        )}
      </div>

      {/* Bottom row: applied date */}
      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
        <Clock className="h-3 w-3" />
        <span>{appliedLabel}</span>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getInitials(name: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function guessSourceFromStage(stage: string | null): string | null {
  if (!stage) return null;
  const s = stage.toLowerCase();
  if (s.includes("linkedin")) return "LinkedIn";
  if (s.includes("referral")) return "Referral";
  if (s.includes("indeed")) return "Indeed";
  if (s.includes("internal")) return "Internal";
  return null;
}

function getSourceBadgeClass(source: string | null): string {
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
