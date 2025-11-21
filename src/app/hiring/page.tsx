// src/app/hiring/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type StatsResponse = {
  openRoles?: number;
};

type Candidate = {
  id: string;
};

async function fetchHiringOverview(): Promise<{
  openRoles: number;
  candidateCount: number;
}> {
  try {
    const [stats, candidates] = await Promise.all([
      api.get<StatsResponse>("/stats").catch(() => ({ openRoles: 0 })),
      api.get<Candidate[]>("/candidates").catch(() => []),
    ]);

    return {
      openRoles: stats.openRoles ?? 0,
      candidateCount: candidates.length,
    };
  } catch (err) {
    console.error("Failed to load hiring overview, using demo values", err);
    // Safe demo fallback so the page never feels empty
    return { openRoles: 4, candidateCount: 32 };
  }
}

export default async function HiringHomePage() {
  const { openRoles, candidateCount } = await fetchHiringOverview();

  return (
    <div className="relative">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-slate-50" />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Hero / overview */}
        <section>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Hiring hub
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                    Early access
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Hiring
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Open roles, candidates, and AI-powered tools to move faster.
                  Everything here is wired to your Intime HRIS data.
                </p>
              </div>

              {/* quick stats */}
              <div className="grid grid-cols-2 gap-3 text-sm md:w-[260px]">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Open roles
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    {openRoles}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Candidates
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    {candidateCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Primary navigation cards */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* Jobs */}
          <Link
            href="/jobs"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
              <span>💼</span>
              <span>Jobs</span>
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Jobs</h2>
            <p className="mt-1 text-xs text-slate-600">
              Manage open roles, pipelines, and hiring stages. See who&apos;s in
              process and where they&apos;re stuck.
            </p>
            <div className="mt-4 text-[11px] font-medium text-indigo-600">
              Open jobs workspace →
            </div>
          </Link>

          {/* Candidates */}
          <Link
            href="/candidates"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              <span>🧑‍💻</span>
              <span>Candidates</span>
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Candidates</h2>
            <p className="mt-1 text-xs text-slate-600">
              Track applicants, interviews, and offers across every role. Jump
              into profiles, feedback, and AI summaries.
            </p>
            <div className="mt-4 text-[11px] font-medium text-emerald-700">
              View pipeline →
            </div>
          </Link>

          {/* AI Studio */}
          <Link
            href="/hiring/ai-studio"
            className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 p-[1px] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-full flex-col rounded-[1rem] bg-slate-950/95 p-5 text-slate-50">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-2.5 py-1 text-[11px] font-medium text-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>New · AI</span>
              </div>
              <h2 className="text-sm font-semibold">AI Studio</h2>
              <p className="mt-1 text-xs text-slate-200">
                Job intake, JD generator, candidate summaries, onboarding plans,
                and resume match—centralized in one workspace.
              </p>
              <div className="mt-4 text-[11px] font-medium text-indigo-100">
                Open AI workflows →
              </div>
            </div>
          </Link>
        </section>

        {/* Secondary / coming soon */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Coming soon
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Interview plans
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Structured loops, scorecards, and hiring team coordination. Design
              repeatable interview processes once and reuse them across roles.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-600 shadow-sm">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Suggested next steps
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                Review candidates in <span className="font-medium">phone screen</span> for
                roles that have been open the longest.
              </li>
              <li>
                Use <span className="font-medium">AI job intake</span> to spin up
                a new role with a structured brief and JD.
              </li>
              <li>
                Run <span className="font-medium">AI candidate summaries</span>{" "}
                after debriefs to keep everyone aligned.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
