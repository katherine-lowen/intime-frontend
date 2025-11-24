// src/app/people/[id]/page.tsx
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
};

export default async function PersonDebugPage({
  params,
}: {
  params: { id: string };
}) {
  let employees: Employee[] = [];
  let error: string | null = null;

  try {
    const data = await api.get<Employee[]>("/employees");
    if (Array.isArray(data)) {
      employees = data;
    } else {
      error = `Expected array from /employees, got: ${typeof data}`;
      console.error(error, data);
    }
  } catch (e: any) {
    error = e?.message ?? String(e);
    console.error("Failed to load /employees in profile debug page", e);
  }

  const index = Number(params.id);
  const byIndex =
    Number.isFinite(index) && index >= 0 && index < employees.length
      ? employees[index]
      : null;

  const byId = employees.find((e) => e.id === params.id) ?? null;

  return (
    <AuthGate>
      <main className="mx-auto max-w-3xl space-y-4 px-6 py-8">
        <h1 className="text-xl font-semibold text-slate-900">
          Debug: Person profile
        </h1>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <p className="font-medium">Route params</p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(params, null, 2)}
          </pre>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-900 space-y-3">
          <div>
            <p className="font-medium">/employees summary</p>
            <p className="mt-1 text-slate-600">
              count: <strong>{employees.length}</strong>
            </p>
          </div>

          <div>
            <p className="font-medium">Indices & IDs</p>
            <pre className="mt-1 max-h-64 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(
                employees.map((e, idx) => ({
                  index: idx,
                  id: e.id,
                  name: `${e.firstName} ${e.lastName}`.trim(),
                })),
                null,
                2
              )}
            </pre>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 text-xs">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-medium">Lookup by index (params.id as number)</p>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
              {byIndex
                ? JSON.stringify(byIndex, null, 2)
                : "No employee found at this index."}
            </pre>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-900">
            <p className="font-medium">Lookup by id (params.id as string)</p>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
              {byId
                ? JSON.stringify(byId, null, 2)
                : "No employee found with this id in /employees list."}
            </pre>
          </div>
        </section>

        {error && (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
            <p className="font-medium">Error loading /employees</p>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
              {error}
            </pre>
          </section>
        )}
      </main>
    </AuthGate>
  );
}
