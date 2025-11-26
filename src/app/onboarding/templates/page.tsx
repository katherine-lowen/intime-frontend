// src/app/onboarding/templates/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type OnboardingTemplateTask = {
  id: string;
  title: string;
  description?: string | null;
  assigneeType?: "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";
  dueRelativeDays?: number | null;
  sortOrder?: number | null;
};

type OnboardingTemplate = {
  id: string;
  name: string;
  description?: string | null;
  department?: string | null;
  role?: string | null;
  isDefault: boolean;
  tasks?: OnboardingTemplateTask[];
  createdAt?: string;
};

async function getTemplates(): Promise<OnboardingTemplate[]> {
  try {
    return await api.get<OnboardingTemplate[]>("/onboarding/templates");
  } catch (err) {
    console.error("Failed to load onboarding templates:", err);
    // Don’t crash the page – just show empty state
    return [];
  }
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

export default async function OnboardingTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Onboarding templates
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Standardize onboarding checklists for roles, departments and
            locations.
          </p>
        </div>
        <Link
          href="/onboarding/templates/new"
          className="inline-flex items-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 transition"
        >
          + New template
        </Link>
      </div>

      {/* Empty state / table */}
      {templates.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-700">
            No onboarding templates yet.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Create your first template to start assigning onboarding flows to
            new hires.
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href="/onboarding/templates/new"
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
            >
              Create template
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Steps
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {t.name}
                      </span>
                      {t.description && (
                        <span className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                          {t.description}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {t.department || t.role ? (
                      <div className="flex flex-col text-xs">
                        {t.department && <span>Dept: {t.department}</span>}
                        {t.role && (
                          <span className="text-slate-500">
                            Role: {t.role}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Any role</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {(t.tasks?.length ?? 0) || 0}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {t.isDefault ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                        Default
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {formatDate(t.createdAt)}
                  </td>

                  <td className="px-4 py-4 text-sm text-right">
                    <Link
                      href={`/onboarding/templates/${t.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 underline underline-offset-2"
                    >
                      View / edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
