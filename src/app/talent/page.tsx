// src/app/talent/page.tsx
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

export default async function TalentOverviewPage() {
  // later this can be wired to real analytics endpoints
  const demoStats = {
    openRoles: 0,
    activeReviews: 0,
    plannedHeadcount: 0,
    activeGoals: 0,
  };

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Talent overview
            </h1>
            <p className="text-sm text-slate-600">
              One place to understand recruiting, headcount, performance, and
              engagement across your org.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              HRIS · Talent workspace
            </span>
          </div>
        </section>

        {/* TOP SUMMARY STRIP */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Open roles</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {demoStats.openRoles}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Pulled from your Jobs & Hiring workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Performance cycles</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {demoStats.activeReviews}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Active or upcoming review cycles in Intime.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Planned headcount</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {demoStats.plannedHeadcount}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Budgeted roles across teams for this year.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Org-level goals</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {demoStats.activeGoals}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Company or team goals tracked in Intime.
            </p>
          </div>
        </section>

        {/* TALENT MODULES GRID */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]">
          {/* LEFT: key programs */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Core talent programs
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                High-level control over recruiting, performance, and growth.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <a
                  href="/hiring"
                  className="group rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs hover:bg-slate-100"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Recruiting
                    </span>
                    <span className="text-lg">📌</span>
                  </div>
                  <p className="text-slate-600">
                    Jobs, pipelines, and AI-assisted hiring flows.
                  </p>
                  <span className="mt-2 inline-flex text-[11px] font-medium text-indigo-600 group-hover:underline">
                    Open hiring workspace →
                  </span>
                </a>

                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Headcount planning
                    </span>
                    <span className="text-lg">👥</span>
                  </div>
                  <p>
                    Plan upcoming roles by team and sync directly to recruiting.
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Coming soon
                  </span>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Review cycles
                    </span>
                    <span className="text-lg">📆</span>
                  </div>
                  <p>
                    Configure performance review templates, timelines, and
                    calibration.
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Coming soon
                  </span>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">1:1s</span>
                    <span className="text-lg">🤝</span>
                  </div>
                  <p>
                    Standardize manager–employee 1:1s and capture notes in one
                    place.
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Growth & engagement
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Programs that keep people aligned, learning, and heard.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs">
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-slate-600">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Goals</span>
                    <span className="text-lg">🎯</span>
                  </div>
                  Track company, team, and individual objectives in one view.
                  <div className="mt-2 text-[10px] text-slate-500">
                    Coming soon
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-slate-600">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Learning
                    </span>
                    <span className="text-lg">🎓</span>
                  </div>
                  Connect training programs to roles, teams, and review cycles.
                  <div className="mt-2 text-[10px] text-slate-500">
                    Coming soon
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-slate-600">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Surveys
                    </span>
                    <span className="text-lg">😊</span>
                  </div>
                  Run pulse surveys and connect sentiment to events and reviews.
                  <div className="mt-2 text-[10px] text-slate-500">
                    Coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: compensation bands & upcoming features */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Compensation bands
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Define salary bands, link them to levels, and keep offers within
                guardrails.
              </p>

              <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-3 py-3 text-xs text-slate-600">
                <p>
                  You&apos;ll be able to create{" "}
                  <span className="font-semibold">bands</span> by level,
                  location, or team, then connect them directly to jobs and
                  offers in the Hiring workspace.
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  As you log comp changes, Intime will highlight equity and pay
                  gaps across your org.
                </p>
                <div className="mt-3 inline-flex rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-slate-50">
                  Roadmap · In design
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs text-slate-600">
              <h2 className="text-sm font-semibold text-slate-900">
                How this connects to the rest of Intime
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>
                  Recruiting pulls planned roles from{" "}
                  <span className="font-medium">Headcount planning</span>.
                </li>
                <li>
                  <span className="font-medium">Review cycles</span> feed into
                  talent risk and promotion recommendations.
                </li>
                <li>
                  <span className="font-medium">Goals</span> and{" "}
                  <span className="font-medium">Learning</span> connect to
                  onboarding and role changes.
                </li>
                <li>
                  <span className="font-medium">Surveys</span> and{" "}
                  <span className="font-medium">Comp bands</span> power
                  retention and fairness insights.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
