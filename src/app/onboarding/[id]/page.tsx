// src/app/onboarding/[id]/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import OnboardingChecklist from "@/components/onboarding-checklist";
import { AuthGate } from "@/components/dev-auth-gate";

type OnboardingTask = {
  id: string;
  label: string;
  status: "PENDING" | "DONE" | "SKIPPED";
  dueDate?: string | null;
  completedAt?: string | null;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
};

type DetailResponse = {
  employee: Employee;
  tasks: OnboardingTask[];
};

async function getDetail(id: string): Promise<DetailResponse> {
  return api.get<DetailResponse>(`/onboarding/${id}`);
}

export default async function OnboardingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const data = await getDetail(id).catch(() => null);

  if (!data) {
    return (
      <main className="p-6">
        <p className="text-sm text-red-600">
          Onboarding not found for this employee.
        </p>
      </main>
    );
  }

  const { employee, tasks } = data;
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const subtitleParts: string[] = [];
  if (employee.title) subtitleParts.push(employee.title);
  if (employee.department) subtitleParts.push(employee.department);
  const subtitle = subtitleParts.join(" • ");

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/onboarding"
            className="text-xs text-indigo-600 hover:underline"
          >
            ← Back to Onboarding
          </Link>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {fullName}
          </h1>
          <p className="text-sm text-slate-600">
            {subtitle || "Team member"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-xs">
          <Link
            href={`/people/${employee.id}`}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
          >
            View profile
          </Link>
        </div>
      </header>

      <OnboardingChecklist employee={employee} initialTasks={tasks} />
    </main>
  );
}
