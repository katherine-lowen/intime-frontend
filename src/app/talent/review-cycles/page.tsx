// src/app/talent/review-cycles/page.tsx
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type DemoCycle = {
  id: string;
  name: string;
  scope: string;
  status: "Draft" | "Scheduled" | "Active" | "Closed";
  period: string;
  participants: number;
};

const demoCycles: DemoCycle[] = [
  {
    id: "1",
    name: "Mid-year 2025 company-wide",
    scope: "All departments · FTE only",
    status: "Draft",
    period: "Jun 1 – Jul 15, 2025",
    participants: 42,
  },
  {
    id: "2",
    name: "Sales Q1 calibration",
    scope: "Sales · US only",
    status: "Closed",
    period: "Jan 5 – Feb 20, 2025",
    participants: 18,
  },
];

export default async function ReviewCyclesPage() {
  const stats = {
    active: demoCycles.filter((c) => c.status === "Active").length,
    scheduled: demoCycles.filter((c) => c.status === "Scheduled").length,
    drafts: demoCycles.filter((c) => c.status === "Draft").length,
    closed: demoCycles.filter((c) => c.status === "Closed").length,
  };

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Review cycles
            </h1>
            <p className="text-sm text-slate-600">
              Design performance cycles that connect to talent, goals, and comp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Talent · Performance reviews
            </span>
            <button className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-sm hover:bg-slate-800">
              + New review cycle
            </button>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard label="Active cycles" value={stats.active} hint="Cycles currently collecting feedback." />
          <SummaryCard label="Scheduled" value={stats.scheduled} hint="Upcoming cycles with defined timelines." />
          <SummaryCard label="Drafts" value={stats.drafts} hint="Cycles you can still configure before launch." />
          <SummaryCard label="Closed" value={stats.closed} hint="Historical data for calibration & promotion." />
        </section>

        {/* MAIN GRID */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
          {/* LEFT: table of cycles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Cycles</h2>
                <p className="text-xs text-slate-500">
                  Start with a simple company-wide cycle, then layer in calibrations by team.
                </p>
              </div>
              <button className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 sm:inline-flex">
                Use template
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <Th>Name</Th>
                    <Th>Scope</Th>
                    <Th>Status</Th>
                    <Th>Period</Th>
                    <Th className="text-right">Participants</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {demoCycles.map((cycle) => (
                    <tr key={cycle.id} className="hover:bg-slate-50/60">
                      <Td>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {cycle.name}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <span className="text-slate-600">{cycle.scope}</span>
                      </Td>
                      <Td>
                        <StatusPill status={cycle.status} />
                      </Td>
                      <Td>
                        <span className="text-slate-600">{cycle.period}</span>
                      </Td>
                      <Td align="right">
                        <span className="text-slate-700">{cycle.participants}</span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: explainer + favorites helper */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs text-slate-600">
              <h2 className="text-sm font-semibold text-slate-900">
                How review cycles connect to Intime
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>
                  Feed calibration and{" "}
                  <span className="font-medium">promotion</span> decisions into
                  your Talent overview.
                </li>
                <li>
                  Sync cycle outcomes to{" "}
                  <span className="font-medium">compensation bands</span> and
                  future offers.
                </li>
                <li>
                  Attach review templates to{" "}
                  <span className="font-medium">roles and levels</span> so new
                  hires automatically inherit the right cycle.
                </li>
              </ul>
            </div>

            {/* Favorites helper card (Rippling-style) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 p-4 text-xs shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Tip
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                  Favorites
                </span>
              </div>
              <p className="text-slate-100">
                Pin your most-used talent apps in the sidebar so they&apos;re always one
                click away.
              </p>

              <div className="mt-3 grid gap-2 rounded-xl bg-slate-800/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-slate-100">
                    <span className="text-sm">📌</span>
                    <span className="text-[11px] font-medium">Recruiting</span>
                  </span>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px]">
                    ★ Starred
                  </span>
                </div>
                <div className="flex items-center justify-between opacity-80">
                  <span className="inline-flex items-center gap-2 text-slate-200">
                    <span className="text-sm">📆</span>
                    <span className="text-[11px] font-medium">
                      Review cycles
                    </span>
                  </span>
                  <span className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px]">
                    ☆ Add to favorites
                  </span>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                In a future version, managers will be able to customize this bar per
                workspace.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}

/* --------- small helper components --------- */

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={
        "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 " +
        (className ?? "")
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-3 py-2 align-top text-xs text-slate-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function StatusPill({ status }: { status: DemoCycle["status"] }) {
  const colorClasses: Record<DemoCycle["status"], string> = {
    Draft: "bg-slate-100 text-slate-700 border-slate-200",
    Scheduled: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Closed: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorClasses[status]}`}
    >
      {status}
    </span>
  );
}
