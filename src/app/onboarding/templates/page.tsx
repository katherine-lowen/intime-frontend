// src/app/onboarding/templates/page.tsx
import Link from "next/link";
import api from "@/lib/api";

type TemplateTaskLite = {
  id: string;
};

type Template = {
  id: string;
  name: string;
  description?: string | null;
  department?: string | null;
  role?: string | null;
  isDefault: boolean;
  tasks: TemplateTaskLite[];
  createdAt: string;
};

async function getTemplates(): Promise<Template[]> {
  return api.get("/onboarding/templates");
}

export default async function OnboardingTemplatesListPage() {
  const templates = await getTemplates();

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Onboarding templates
          </h1>
          <p className="text-sm text-slate-600">
            Reusable onboarding plans, grouped by department and role.
          </p>
        </div>

        <Link
          href="/onboarding/templates/new"
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          New template
        </Link>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Template</th>
              <th className="px-3 py-2 text-left">Department</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Tasks</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  No templates yet. Create your first onboarding template.
                </td>
              </tr>
            ) : (
              templates.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-b-0 hover:bg-slate-50/70"
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{t.name}</div>
                    {t.description && (
                      <div className="text-xs text-slate-500">
                        {t.description}
                      </div>
                    )}
                    {t.isDefault && (
                      <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                        Default template
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {t.department ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {t.role ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {t.tasks.length} task
                    {t.tasks.length === 1 ? "" : "s"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/onboarding/templates/${t.id}`}
                      className="text-xs font-medium text-indigo-600 hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
