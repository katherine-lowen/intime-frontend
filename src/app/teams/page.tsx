// src/app/teams/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type Team = {
  id: string;
  name: string;
  employeesCount: number;
};

async function getTeams(): Promise<Team[]> {
  try {
    const raw = await api.get<Team[]>("/teams");

    // raw is Team[] | undefined, so normalize it
    if (!raw) {
      console.error("No data returned from /teams");
      return [];
    }

    if (!Array.isArray(raw)) {
      console.error("Unexpected /teams response shape:", raw);
      return [];
    }

    return raw;
  } catch (err) {
    console.error("Failed to load teams:", err);
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await getTeams();

  const totalHeadcount = teams.reduce(
    (sum, t) => sum + (t.employeesCount || 0),
    0
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400">People</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Teams
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Logical groups of employees for reporting, analytics, and headcount.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              <span className="font-semibold text-slate-900">
                {teams.length}
              </span>{" "}
              teams
            </span>
            <span className="h-4 w-px bg-slate-200" />
            <span>
              <span className="font-semibold text-emerald-700">
                {totalHeadcount}
              </span>{" "}
              employees
            </span>
          </div>
          <Link
            href="/people/new"
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Add employee
          </Link>
        </div>
      </header>

      {/* Empty state */}
      {teams.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
          <p>No teams yet.</p>
          <p className="mt-2">
            Teams are created automatically when you start assigning employees
            to them, or you can add them manually.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {teams.map((t) => (
            <Link
              key={t.id}
              href={`/teams/${t.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                    {t.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {t.employeesCount === 1
                      ? "1 person"
                      : `${t.employeesCount} people`}
                  </p>
                </div>
                <div className="rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-50 group-hover:bg-slate-900">
                  View team
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
