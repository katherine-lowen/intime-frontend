// src/app/operations/page.tsx
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type HeadcountStats = {
  total: number;
  active: number;
  onLeave: number;
  contractors: number;
  alumni: number;
  newLast30Days: number;
  exitsLast30Days: number;
};

type TimeOffTypeSummary = {
  type: string;
  count: number;
};

type TimeOffStats = {
  totalRequestsLast90: number;
  approvedLast90: number;
  deniedLast90: number;
  pendingLast90: number;
  topTypesLast90: TimeOffTypeSummary[];
};

type StageCount = {
  stage: string;
  count: number;
};

type HiringStats = {
  openJobs: number;
  closedJobs: number;
  candidatesLast90: number;
  candidatesByStageLast90: StageCount[];
  offersLast30: number;
  hiresLast30: number;
};

type TeamSummary = {
  id: string;
  name: string;
  employeeCount: number;
};

type HrOverview = {
  orgId: string;
  headcount: HeadcountStats;
  timeOff: TimeOffStats;
  hiring: HiringStats;
  teams: TeamSummary[];
  generatedAt: string;
};

type AiInsights = {
  summary: string;
  suggestions: string[];
};

async function getHrOverview(): Promise<HrOverview> {
  return api.get<HrOverview>("/hr-overview");
}

async function getAiOverviewInsights(): Promise<AiInsights | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  try {
    const res = await fetch(`${baseUrl}/api/ai-insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // dashboard scope – see api/ai-insights route we wired up
      body: JSON.stringify({ scope: "dashboard" }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("AI insights error (dashboard):", await res.text());
      return null;
    }
    return (await res.json()) as AiInsights;
  } catch (err) {
    console.error("AI insights fetch failed (dashboard):", err);
    return null;
  }
}

function percent(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

export default async function OperationsHomePage() {
  const [overview, ai] = await Promise.all([
    getHrOverview(),
    getAiOverviewInsights(),
  ]);

  const { headcount, timeOff, hiring, teams } = overview;
  const generatedAt = new Date(overview.generatedAt);

  return (
    <AuthGate>
      <main className="p-6 space-y-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold">HR Overview</h1>
            <p className="text-sm text-muted-foreground">
              Live snapshot of headcount, time off, and hiring activity across
              your org.
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Org ID: {overview.orgId}</div>
            <div>
              Updated:{" "}
              {generatedAt.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </header>

        {/* Metrics grid */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total headcount"
            value={headcount.total}
            subtitle={`${headcount.newLast30Days} new in last 30 days`}
          />
          <MetricCard
            label="Active employees"
            value={headcount.active}
            subtitle={`${headcount.onLeave} on leave, ${headcount.contractors} contractors`}
          />
          <MetricCard
            label="Attrition (last 30 days)"
            value={headcount.exitsLast30Days}
            subtitle={`${headcount.alumni} alumni total`}
          />
          <MetricCard
            label="Open roles"
            value={hiring.openJobs}
            subtitle={`${hiring.candidatesLast90} candidates in last 90 days`}
          />
        </section>

        {/* Main content: left = charts/cards, right = AI insights */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Headcount breakdown */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">Headcount breakdown</h2>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  By status
                </span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                How your current headcount splits across employee statuses.
              </p>

              <div className="space-y-3">
                <BarRow
                  label="Active"
                  value={headcount.active}
                  total={headcount.total}
                />
                <BarRow
                  label="On leave"
                  value={headcount.onLeave}
                  total={headcount.total}
                />
                <BarRow
                  label="Contractors"
                  value={headcount.contractors}
                  total={headcount.total}
                />
                <BarRow
                  label="Alumni"
                  value={headcount.alumni}
                  total={headcount.total}
                />
              </div>
            </div>

            {/* Time off & PTO */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">Time off (last 90 days)</h2>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  PTO signal
                </span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Balance between approved, denied, and pending requests. Spikes
                here can indicate burnout or coverage gaps.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <TinyStat
                  label="Total requests"
                  value={timeOff.totalRequestsLast90}
                  hint="All time off requests created in the last 90 days."
                />
                <TinyStat
                  label="Approved"
                  value={timeOff.approvedLast90}
                  hint="Approved requests in the last 90 days."
                />
                <TinyStat
                  label="Pending / denied"
                  value={timeOff.pendingLast90 + timeOff.deniedLast90}
                  hint="Requests still pending or denied."
                />
              </div>

              {timeOff.topTypesLast90.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground">
                    Most common leave types
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {timeOff.topTypesLast90.map((t) => (
                      <span
                        key={t.type}
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        <span className="mr-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-500">
                          {t.count}
                        </span>
                        {t.type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hiring pipeline */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">Hiring pipeline</h2>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Last 90 days
                </span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Where candidates are stacking up across your funnel.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <TinyStat
                  label="Candidates"
                  value={hiring.candidatesLast90}
                  hint="Candidates created in the last 90 days."
                />
                <TinyStat
                  label="Offers (30d)"
                  value={hiring.offersLast30}
                  hint="Candidates currently in offer stage created in the last 30 days."
                />
                <TinyStat
                  label="Hires (30d)"
                  value={hiring.hiresLast30}
                  hint="Candidates at hired stage created in the last 30 days."
                />
              </div>

              {hiring.candidatesByStageLast90.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground">
                    Candidates by stage
                  </div>
                  <div className="space-y-2">
                    {hiring.candidatesByStageLast90.map((stage) => (
                      <div
                        key={stage.stage}
                        className="flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-medium">
                              {stage.stage || "Unknown"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {stage.count}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{
                                width: `${percent(
                                  stage.count,
                                  hiring.candidatesLast90 || 1,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Teams snapshot */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium">Teams snapshot</h2>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Headcount by team
                </span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Quick view of how headcount is distributed across teams.
              </p>

              {teams.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No teams yet. As you add teams and assign employees, they will
                  appear here.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {teams.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{t.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {t.employeeCount}{" "}
                          {t.employeeCount === 1 ? "person" : "people"}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {percent(t.employeeCount, headcount.total)}% of org
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column – AI insights */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-4 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-blue-100">
                  AI org health insights
                </h2>
                <span className="text-[10px] uppercase tracking-wide text-blue-300/80">
                  Experimental
                </span>
              </div>
              <p className="mb-3 text-xs text-blue-100/80">
                An AI pass over your headcount, PTO, and hiring data to surface
                patterns a busy HR team might miss – especially potential
                moats.
              </p>

              {ai ? (
                <>
                  <p className="mb-3 text-xs text-blue-50/90">{ai.summary}</p>
                  <div className="space-y-2">
                    {ai.suggestions.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 rounded-lg bg-slate-900/80 p-2 text-xs text-blue-50/90"
                      >
                        <span className="mt-0.5 text-[10px] text-blue-300/80">
                          ●
                        </span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-slate-900/80 p-3 text-xs text-blue-50/80">
                  <p className="mb-1 font-medium">
                    AI is not fully configured yet.
                  </p>
                  <p>
                    Once you add an OpenAI key and more data flows in, this
                    panel will highlight:
                  </p>
                  <ul className="mt-2 list-disc pl-4 text-[11px]">
                    <li>Teams that quietly act as glue across the org.</li>
                    <li>
                      Roles where you close candidates faster than the market.
                    </li>
                    <li>
                      PTO and time-off patterns that hint at burnout or moats.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide">
                How to use this view
              </div>
              <p>
                Use headcount trends and PTO patterns to spot where work is
                concentrated, then check hiring pipeline to see if you&apos;re
                proactively backfilling those pressure points.
              </p>
              <p className="mt-2">
                Over time, this becomes your executive briefing for how people,
                time, and hiring interact as a real moat.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </AuthGate>
  );
}

/* ---------- Small presentational components ---------- */

function MetricCard(props: {
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="text-[11px] font-medium text-muted-foreground">
        {props.label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">
        {props.value}
      </div>
      {props.subtitle && (
        <div className="mt-1 text-[11px] text-muted-foreground">
          {props.subtitle}
        </div>
      )}
    </div>
  );
}

function BarRow(props: { label: string; value: number; total: number }) {
  const pct = percent(props.value, props.total || 1);
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium">{props.label}</span>
        <span className="text-[11px] text-muted-foreground">
          {props.value} · {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div
          className="h-1.5 rounded-full bg-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TinyStat(props: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
      <div className="text-[11px] font-medium text-muted-foreground">
        {props.label}
      </div>
      <div className="mt-1 text-lg font-semibold">{props.value}</div>
      {props.hint && (
        <div className="mt-1 text-[10px] text-muted-foreground">
          {props.hint}
        </div>
      )}
    </div>
  );
}
