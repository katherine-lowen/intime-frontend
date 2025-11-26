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
    // Never crash the server component – just show an empty state
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Onboarding templates
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Standardize onboarding checklists for roles, departments and locations.
          </p>
        </div>
        <Link
          href="/onboarding/templates/new"
          className="inline-flex items-center rounded-md border border-indigo-500/60 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/20 transition"
        >
          + New template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-400">
          <p className="text-sm">No onboarding templates yet.</p>
          <p className="mt-1 text-xs text-slate-500">
            Create your first template to start assigning onboarding flows to new hires.
          </p>
          <div className="mt-4">
            <Link
              href="/onboarding/templates/new"
              className="inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition"
            >
              Create template
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-950/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Steps
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{t.name}</span>
                      {t.description && (
                        <span className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                          {t.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    <div className="flex flex-col">
                      {t.department && (
                        <span className="text-xs text-slate-300">
                          Dept: {t.department}
                        </span>
                      )}
                      {t.role && (
                        <span className="text-xs text-slate-400">
                          Role: {t.role}
                        </span>
                      )}
                      {!t.department && !t.role && (
                        <span className="text-xs text-slate-500">Any role</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {(t.tasks?.length ?? 0) || 0}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {t.isDefault ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-500/40">
                        Default
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {formatDate(t.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Link
                      href={`/onboarding/templates/${t.id}`}
                      className="text-xs font-medium text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
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
