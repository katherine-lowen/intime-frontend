// src/app/onboarding/templates/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AssigneeType = "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";

type TemplateTask = {
  id: string;
  title: string;
  description?: string | null;
  assigneeType?: AssigneeType;
  dueRelativeDays?: number | null;
  sortOrder?: number | null;
};

type Template = {
  id: string;
  name: string;
  description?: string | null;
  department?: string | null;
  role?: string | null;
  isDefault: boolean;
  tasks?: TemplateTask[];
  createdAt?: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function OnboardingTemplateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [template, setTemplate] = useState<Template | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Employees for "Apply to employee"
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  // Load template
  useEffect(() => {
    let cancelled = false;

    async function fetchTemplate() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/onboarding/templates/${id}`, {
          headers: {
            "x-org-id": ORG_ID,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          console.error(
            "Failed to load onboarding template",
            res.status,
            text,
          );
          throw new Error(`Failed to load template: ${res.status}`);
        }

        const data = (await res.json()) as Template;

        if (!cancelled) {
          setTemplate(data);
          setName(data.name ?? "");
          setDescription(data.description ?? "");
          setDepartment(data.department ?? "");
          setRole(data.role ?? "");
          setIsDefault(data.isDefault ?? false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load template.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTemplate();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load employees for apply dropdown
  useEffect(() => {
    let cancelled = false;

    async function fetchEmployees() {
      setEmployeesLoading(true);
      try {
        const res = await fetch(`${API_BASE}/employees`, {
          headers: {
            "x-org-id": ORG_ID,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load employees", res.status, text);
          throw new Error(`Failed to load employees: ${res.status}`);
        }

        const data = (await res.json()) as Employee[];

        if (!cancelled) {
          setEmployees(data);
          if (data.length > 0) {
            setSelectedEmployeeId((prev) => prev || data[0].id);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
        }
      } finally {
        if (!cancelled) {
          setEmployeesLoading(false);
        }
      }
    }

    fetchEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!template) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/onboarding/templates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": ORG_ID,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          department: department.trim() || null,
          role: role.trim() || null,
          isDefault,
          // steps/tasks unchanged for now
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Update onboarding template failed:", res.status, text);
        throw new Error(`Update failed: ${res.status}`);
      }

      const updated = (await res.json()) as Template;
      setTemplate(updated);
    } catch (e: any) {
      setError(e?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!template) return;

    const confirmed = window.confirm(
      "Delete this onboarding template? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/onboarding/templates/${id}`, {
        method: "DELETE",
        headers: {
          "x-org-id": ORG_ID,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete onboarding template failed:", res.status, text);
        throw new Error(`Delete failed: ${res.status}`);
      }

      router.push("/onboarding/templates");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to delete template.");
      setDeleting(false);
    }
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setApplyMessage("Select an employee first.");
      return;
    }

    setApplying(true);
    setApplyMessage(null);

    try {
      const res = await fetch(
        `${API_BASE}/onboarding/templates/${id}/apply/${selectedEmployeeId}`,
        {
          method: "POST",
          headers: {
            "x-org-id": ORG_ID,
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Apply onboarding template failed:", res.status, text);
        throw new Error(`Apply failed: ${res.status}`);
      }

      // You could parse the created flow here if you want
      setApplyMessage("Onboarding flow created for this employee.");
    } catch (e: any) {
      setApplyMessage(e?.message || "Failed to apply template.");
    } finally {
      setApplying(false);
    }
  }

  function formatDate(value?: string) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  }

  if (loading && !template) {
    return (
      <div className="px-6 py-6">
        <div className="max-w-4xl animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-800" />
          <div className="h-4 w-72 rounded bg-slate-900" />
          <div className="h-40 w-full rounded bg-slate-900" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="px-6 py-6">
        <div className="max-w-2xl rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error || "Template not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <form
        onSubmit={handleSave}
        className="mx-auto max-w-4xl space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">
              {template.name || "Onboarding template"}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Edit template details, review the onboarding checklist, or apply it to a new hire.
            </p>
            {template.createdAt && (
              <p className="mt-1 text-xs text-slate-500">
                Created {formatDate(template.createdAt)}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => router.push("/onboarding/templates")}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Back to templates
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center rounded-md border border-red-500/60 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete template"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Template details */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Template name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Description
              </label>
              <textarea
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Department
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role / title
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <span>Set as default onboarding template</span>
            </label>

            <p className="text-xs text-slate-500">
              Default templates can be auto-suggested for new hires in this department or role.
            </p>
          </div>
        </div>

        {/* Apply to employee */}
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Apply to employee
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Create an onboarding flow for an existing employee using this template.
              </p>
            </div>
            {employeesLoading && (
              <span className="text-[11px] text-slate-500">
                Loading employees…
              </span>
            )}
          </div>

          <form
            onSubmit={handleApply}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Employee
              </label>
              <select
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={employeesLoading || employees.length === 0}
              >
                {employees.length === 0 ? (
                  <option value="">
                    {employeesLoading
                      ? "Loading employees…"
                      : "No employees found"}
                  </option>
                ) : (
                  employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                      {emp.title ? ` — ${emp.title}` : ""}
                      {emp.department ? ` (${emp.department})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex-none">
              <button
                type="submit"
                disabled={
                  applying ||
                  employeesLoading ||
                  !selectedEmployeeId ||
                  employees.length === 0
                }
                className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {applying ? "Creating flow…" : "Apply template"}
              </button>
            </div>
          </form>

          {applyMessage && (
            <p className="text-xs text-slate-300">{applyMessage}</p>
          )}
        </div>

        {/* Steps / tasks (read-only for now) */}
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Steps
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                This checklist is applied to new hires when you use this template.
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              Editing step details will be supported in a later version.
            </p>
          </div>

          {template.tasks && template.tasks.length > 0 ? (
            <ol className="space-y-2">
              {template.tasks
                .slice()
                .sort(
                  (a, b) =>
                    (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
                )
                .map((task, index) => (
                  <li
                    key={task.id}
                    className="flex gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3"
                  >
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-200">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-100">
                          {task.title}
                        </span>
                        {task.assigneeType && (
                          <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-slate-300">
                            {task.assigneeType}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="mt-1 text-xs text-slate-400">
                          {task.description}
                        </p>
                      )}
                      {task.dueRelativeDays != null && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Due {task.dueRelativeDays} day
                          {task.dueRelativeDays === 1 ? "" : "s"} after start
                        </p>
                      )}
                    </div>
                  </li>
                ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-500">
              This template currently has no steps. You can create a new template with a full checklist from the templates list.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/onboarding/templates")}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
