// src/app/onboarding/templates/[id]/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import ApplyOnboardingTemplateForm from "@/components/apply-onboarding-template-form";

type TemplateTask = {
  id: string;
  title: string;
  description?: string | null;
  assigneeType: string;
  dueRelativeDays?: number | null;
};

type Template = {
  id: string;
  name: string;
  description?: string | null;
  department?: string | null;
  role?: string | null;
  isDefault: boolean;
  tasks: TemplateTask[];
  createdAt: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

async function getTemplate(id: string): Promise<Template> {
  return api.get(`/onboarding/templates/${id}`);
}

async function getEmployees(): Promise<Employee[]> {
  // reuse your existing /employees endpoint
  return api.get("/employees");
}

export default async function OnboardingTemplateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [template, employees] = await Promise.all([
    getTemplate(params.id),
    getEmployees(),
  ]);

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/onboarding/templates"
            className="text-xs text-indigo-600 hover:underline"
          >
            ← Back to templates
          </Link>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {template.name}
          </h1>

          <p className="text-sm text-slate-600">
            {template.description || "Onboarding template"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {template.department && (
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5">
                {template.department}
              </span>
            )}
            {template.role && (
              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5">
                {template.role}
              </span>
            )}
            {template.isDefault && (
              <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">
                Default template
              </span>
            )}
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5">
              {template.tasks.length} task
              {template.tasks.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="w-full max-w-xs rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
          <ApplyOnboardingTemplateForm
            templateId={template.id}
            employees={employees}
          />
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Tasks in this template
        </h2>

        {template.tasks.length === 0 ? (
          <p className="text-sm text-slate-500">
            This template doesn&apos;t have any tasks yet.
          </p>
        ) : (
          <ol className="space-y-3">
            {template.tasks.map((task, index) => (
              <li
                key={task.id}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-slate-400">
                      Step {index + 1}
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="mt-1 text-xs text-slate-600">
                        {task.description}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-500">
                    <div className="inline-flex rounded-full bg-white px-2 py-0.5 border border-slate-200">
                      {task.assigneeType}
                    </div>
                    <div className="mt-1">
                      {task.dueRelativeDays == null
                        ? "No due date"
                        : `Due ${task.dueRelativeDays} day${
                            task.dueRelativeDays === 1 ? "" : "s"
                          } after start`}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
