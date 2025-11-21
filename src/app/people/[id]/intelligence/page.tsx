// src/app/people/[id]/intelligence/page.tsx
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
};

async function getEmployee(id: string): Promise<Employee> {
  return api.get<Employee>(`/employees/${id}`);
}

export const dynamic = "force-dynamic";

export default async function PeopleIntelligencePage({
  params,
}: {
  params: { id: string };
}) {
  const employee = await getEmployee(params.id);

  return (
    <AuthGate>
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            People intelligence
          </h1>
          <p className="text-sm text-slate-600">
            Early AI view of{" "}
            <span className="font-medium">
              {employee.firstName} {employee.lastName}
            </span>
            . This page will evolve into a richer timeline and insights hub.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Overview (placeholder)
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            In the full version, this page will combine performance reviews,
            time off patterns, team changes, and feedback into a single,
            AI-generated narrative about this person&apos;s impact and trends
            over time.
          </p>
        </div>
      </div>
    </AuthGate>
  );
}
