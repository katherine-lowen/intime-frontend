// src/app/talent/headcount/page.tsx
import { AuthGate } from "@/components/dev-auth-gate";
import { orgHref } from "@/lib/org-base";


export const dynamic = "force-dynamic";

type HeadcountRow = {
  team: string;
  filled: number;
  planned: number;
  delta: number;
  newRoles?: string[];
};

const demoData: HeadcountRow[] = [
  {
    team: "Engineering",
    filled: 12,
    planned: 15,
    delta: 3,
    newRoles: ["Backend Engineer", "QA Lead", "DevOps"],
  },
  {
    team: "Sales",
    filled: 6,
    planned: 8,
    delta: 2,
    newRoles: ["AE", "SDR"],
  },
  {
    team: "Marketing",
    filled: 3,
    planned: 4,
    delta: 1,
    newRoles: ["Content Manager"],
  },
  {
    team: "Support",
    filled: 4,
    planned: 5,
    delta: 1,
    newRoles: ["Support Specialist"],
  },
];

export default async function HeadcountPlanningPage() {
  const totals = demoData.reduce(
    (acc, row) => {
      acc.filled += row.filled;
      acc.planned += row.planned;
      acc.delta += row.delta;
      return acc;
    },
    { filled: 0, planned: 0, delta: 0 }
  );

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Headcount planning
            </h1>
            <p className="text-sm text-slate-600">
              Forecast roles by team and sync planned openings to Recruiting.
            </p>
          </div>

          <button className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-50 shadow hover:bg-slate-800">
            + Add planned role
          </button>
        </section>

        {/* SUMMARY */}
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Filled roles" value={totals.filled} />
          <SummaryCard label="Planned roles" value={totals.planned} />
          <SummaryCard label="Openings expected" value={totals.delta} />
        </section>

        {/* MAIN GRID */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
          {/* LEFT: TABLE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Team headcount
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Each team’s current & planned capacity for this year.
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <Th>Team</Th>
                    <Th>Filled</Th>
                    <Th>Planned</Th>
                    <Th>Openings</Th>
                    <Th>Upcoming roles</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {demoData.map((row) => (
                    <tr key={row.team} className="hover:bg-slate-50/60">
                      <Td>
                        <span className="font-medium text-slate-900">
                          {row.team}
                        </span>
                      </Td>
                      <Td>{row.filled}</Td>
                      <Td>{row.planned}</Td>
                      <Td>
                        <span className="text-slate-700">{row.delta}</span>
                      </Td>
                      <Td>
                        <div className="flex flex-col gap-0.5 text-slate-600">
                          {row.newRoles?.map((role) => (
                            <span key={role}>{role}</span>
                          ))}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: EXPLAINER */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-xs text-slate-600">
              <h3 className="text-sm font-semibold text-slate-900">
                How headcount planning works
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>
                  Add{" "}
                  <span className="font-medium">planned roles</span> for any
                  team or department.
                </li>
                <li>
                  Sync planned openings into{" "}
                  <span className="font-medium">Recruiting</span> as draft jobs.
                </li>
                <li>
                  Compare staffing needs with{" "}
                  <span className="font-medium">org growth</span> and budget.
                </li>
              </ul>
            </div>

            {/* SYNC CARD */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100 shadow-sm">
              <h3 className="text-sm font-semibold text-white">
                Sync to Recruiting
              </h3>
              <p className="mt-1 text-slate-300">
                Convert planned roles directly into job drafts in the Hiring
                workspace.
              </p>

              <a
                href={orgHref("/hiring")}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 hover:underline"
              >
                Open Hiring workspace →
              </a>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-xs text-slate-700">{children}</td>;
}
