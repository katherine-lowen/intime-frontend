import Link from "next/link";
import { fetchPipelineForOrgJob } from "@/lib/api-pipeline";

type PageProps = {
  params: Promise<{ orgSlug: string; jobId: string }>;
};

export default async function JobPipelinePage({ params }: PageProps) {
  const { orgSlug, jobId } = await params;
  const pipeline = await fetchPipelineForOrgJob(orgSlug, jobId);

  const job = pipeline.job;
  const stages = pipeline.stages ?? [];
  const candidates = pipeline.candidates ?? [];

  // Group candidates by stageId
  const byStage = new Map<string, typeof candidates>();
  for (const c of candidates) {
    const key = c.stageId ?? "__unassigned__";
    byStage.set(key, [...(byStage.get(key) ?? []), c]);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/org/${orgSlug}/jobs`}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              ← Jobs
            </Link>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-500">Pipeline</span>
          </div>

          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {job?.title ?? "Hiring pipeline"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Stages and candidates for this role. Live from your backend.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50">
            Add candidate
          </button>
          <button className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-black">
            Move stage
          </button>
        </div>
      </header>

      {/* Job meta */}
      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-medium text-slate-900">Job ID:</span>{" "}
            {jobId}
          </div>
          <div className="flex gap-2 text-xs">
            <MetaPill label="Status" value={job?.status ?? "—"} />
            <MetaPill label="Department" value={job?.department ?? "—"} />
            <MetaPill label="Location" value={job?.location ?? "—"} />
            <MetaPill label="Candidates" value={String(candidates.length)} />
          </div>
        </div>
      </section>

      {/* Kanban */}
      {stages.length === 0 ? (
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-xs text-slate-500">
            No stages found for this job yet.
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Pipeline stages
            </h2>
            <p className="text-xs text-slate-500">
              Endpoint: <span className="font-medium">/org/{orgSlug}/jobs/{jobId}/pipeline</span>
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {stages
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((stage) => {
                const stageCandidates = byStage.get(stage.id) ?? [];
                return (
                  <KanbanColumn
                    key={stage.id}
                    title={stage.name}
                    count={stageCandidates.length}
                  >
                    {stageCandidates.length === 0 ? (
                      <EmptyCard />
                    ) : (
                      stageCandidates.map((c) => (
                        <CandidateCard key={c.applicationId} c={c} />
                      ))
                    )}
                  </KanbanColumn>
                );
              })}

            {/* Unassigned bucket if needed */}
            {(byStage.get("__unassigned__")?.length ?? 0) > 0 && (
              <KanbanColumn
                title="Unassigned"
                count={byStage.get("__unassigned__")!.length}
              >
                {byStage.get("__unassigned__")!.map((c) => (
                  <CandidateCard key={c.applicationId} c={c} />
                ))}
              </KanbanColumn>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function MetaPill(props: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700">
      <span className="text-slate-500">{props.label}</span>
      <span className="font-medium text-slate-900">{props.value}</span>
    </span>
  );
}

function KanbanColumn(props: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-[280px] max-w-[280px] rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-800">{props.title}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">
          {props.count}
        </span>
      </div>
      <div className="space-y-2">{props.children}</div>
    </div>
  );
}

function CandidateCard({
  c,
}: {
  c: {
    candidateName: string | null;
    candidateEmail: string | null;
    matchScore: number | null;
    candidateStage: string | null;
  };
}) {
  const initials = (c.candidateName ?? "Candidate")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const match =
    typeof c.matchScore === "number" ? Math.round(c.matchScore) : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700">
            {initials || "C"}
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-medium text-slate-900">
              {c.candidateName ?? "Unnamed candidate"}
            </p>
            <p className="text-[11px] text-slate-500">
              {c.candidateEmail ?? "—"}
            </p>
          </div>
        </div>

        {match !== null && (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            {match}% fit
          </span>
        )}
      </div>

      {c.candidateStage && (
        <p className="mt-2 text-[11px] text-slate-500">
          Candidate stage: <span className="font-medium">{c.candidateStage}</span>
        </p>
      )}
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 p-3 text-[11px] text-slate-500">
      No candidates
    </div>
  );
}
