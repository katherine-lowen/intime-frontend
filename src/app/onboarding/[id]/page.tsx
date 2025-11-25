// src/app/onboarding/[id]/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import OnboardingChecklist from "@/components/onboarding-checklist";
import { AuthGate } from "@/components/dev-auth-gate";

type OnboardingTaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED";

type TaskFromApi = {
  id: string;
  title: string;
  description?: string | null;
  status: OnboardingTaskStatus;
  dueRelativeDays?: number | null;
  completedAt?: string | null;
};

type EmployeeFromApi = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

type FlowFromApi = {
  id: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETE" | "ARCHIVED";
  startDate?: string | null;
  targetDate?: string | null;
  employee: EmployeeFromApi;
  tasks: TaskFromApi[];
};

// Shape expected by <OnboardingChecklist>
type ChecklistEmployee = EmployeeFromApi & {
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
};

type ChecklistTask = {
  id: string;
  label: string;
  status: "PENDING" | "DONE" | "SKIPPED";
  dueDate?: string | null;
  completedAt?: string | null;
};

async function getFlow(id: string): Promise<FlowFromApi> {
  // Backend: GET /onboarding/flows/:id
  return api.get<FlowFromApi>(`/onboarding/flows/${id}`);
}

export const dynamic = "force-dynamic";

export default async function OnboardingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const flow = await getFlow(id).catch(() => null);

  if (!flow) {
    return (
      <AuthGate>
        <main className="px-6 py-8">
          <p className="text-sm text-red-600">
            Onboarding flow not found for this ID.
          </p>
        </main>
      </AuthGate>
    );
  }

  // Map API employee -> checklist employee with onboardingStatus
  const apiEmployee = flow.employee;

  let onboardingStatus: ChecklistEmployee["onboardingStatus"];
  switch (flow.status) {
    case "COMPLETE":
    case "ARCHIVED":
      onboardingStatus = "COMPLETED";
      break;
    case "ACTIVE":
      onboardingStatus = "IN_PROGRESS";
      break;
    case "DRAFT":
    default:
      onboardingStatus = "NOT_STARTED";
      break;
  }

  const employee: ChecklistEmployee = {
    ...apiEmployee,
    onboardingStatus,
  };

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const subtitleParts: string[] = [];
  if (employee.title) subtitleParts.push(employee.title);
  if (employee.department) subtitleParts.push(employee.department);
  const subtitle = subtitleParts.join(" • ");

  // Map the new task shape → the shape expected by OnboardingChecklist
  const checklistTasks: ChecklistTask[] = flow.tasks.map((t) => ({
    id: t.id,
    label: t.title,
    // Collapse IN_PROGRESS into PENDING for the existing UI
    status:
      t.status === "DONE"
        ? "DONE"
        : t.status === "SKIPPED"
        ? "SKIPPED"
        : "PENDING",
    // You can later turn dueRelativeDays + startDate into a real date
    dueDate: null,
    completedAt: t.completedAt ?? null,
  }));

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              href="/onboarding"
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back to Onboarding
            </Link>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
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

        <OnboardingChecklist employee={employee} initialTasks={checklistTasks} />
      </main>
    </AuthGate>
  );
}
