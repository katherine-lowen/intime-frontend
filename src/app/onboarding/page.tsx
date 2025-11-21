// src/app/onboarding/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

type OnboardingTask = {
  id: string;
  label: string;
  status: "PENDING" | "DONE" | "SKIPPED";
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  onboardingTasks?: OnboardingTask[];
};

async function getOnboarding() {
  return api.get<Employee[]>("/onboarding");
}

function progress(tasks: OnboardingTask[] | undefined) {
  if (!tasks || tasks.length === 0) return { done: 0, total: 0 };
  const done = tasks.filter((t) => t.status === "DONE").length;
  return { done, total: tasks.length };
}

export default async function OnboardingListPage() {
  const employees = await getOnboarding();

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Onboarding
          </h1>
          <p className="text-sm text-slate-600">
            Track new hires and their onboarding checklists.
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white/80">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Onboarding</th>
              <th className="px-3 py-2 text-left">Progress</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-sm text-slate-500"
                >
                  No employees yet. Add people to start onboarding.
                </td>
              </tr>
            ) : (
              employees.map((e) => {
                const { done, total } = progress(e.onboardingTasks);
                const percent =
                  total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                  <tr
                    key={e.id}
                    className="border-b last:border-b-0 hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">
                        {e.firstName} {e.lastName}
                      </div>
                      {e.department && (
                        <div className="text-xs text-slate-500">
                          {e.department}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-slate-600">
                        {e.title ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {e.onboardingStatus
                          .toLowerCase()
                          .replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {total === 0 ? (
                        <span className="text-xs text-slate-500">
                          No checklist yet
                        </span>
                      ) : (
                        <span className="text-xs text-slate-700">
                          {done}/{total} tasks ({percent}%)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/onboarding/${e.id}`}
                        className="text-xs font-medium text-indigo-600 hover:underline"
                      >
                        View checklist →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
