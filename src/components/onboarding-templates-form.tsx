// src/components/onboarding-template-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AssigneeType = "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";

export type OnboardingTemplateTask = {
  id?: string;
  title: string;
  description?: string | null;
  assigneeType?: AssigneeType;
  dueRelativeDays?: number | null;
  sortOrder?: number | null;
};

export type OnboardingTemplate = {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
  department?: string | null;
  role?: string | null;
  isDefault: boolean;
  tasks: OnboardingTemplateTask[];
};

type Props = {
  mode: "create" | "edit";
  initial?: OnboardingTemplate | null;
};

export default function OnboardingTemplateForm({ mode, initial }: Props) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [isDefault, setIsDefault] = useState<boolean>(initial?.isDefault ?? false);
  const [tasks, setTasks] = useState<OnboardingTemplateTask[]>(
    initial?.tasks?.length
      ? [...initial.tasks].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        )
      : [
          {
            title: "Welcome email",
            description: "Send a personalized welcome note before day 1.",
            assigneeType: "HR",
            dueRelativeDays: -1,
          },
          {
            title: "First-day 1:1 with manager",
            description: "Align on expectations, goals, and communication style.",
            assigneeType: "MANAGER",
            dueRelativeDays: 0,
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTask() {
    setTasks((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        assigneeType: "EMPLOYEE",
        dueRelativeDays: 0,
      },
    ]);
  }

  function updateTask(index: number, patch: Partial<OnboardingTemplateTask>) {
    setTasks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function removeTask(index: number) {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name,
        description: description || null,
        department: department || null,
        role: role || null,
        isDefault,
        tasks: tasks.map((t, index) => ({
          title: t.title,
          description: t.description || null,
          assigneeType: t.assigneeType ?? "EMPLOYEE",
          dueRelativeDays:
            t.dueRelativeDays === undefined || t.dueRelativeDays === null
              ? null
              : Number(t.dueRelativeDays),
          sortOrder: index,
        })),
      };

      const url =
        mode === "create"
          ? "/api/onboarding/templates"
          : `/api/onboarding/templates/${initial?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Template save failed:", res.status, text);
        throw new Error(`Save failed: ${res.status}`);
      }

      router.push("/onboarding/templates");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to save template");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Basic template info */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-700">
            Template name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="30-60-90 Day Engineer Onboarding"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="What this template is for and when to use it."
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-slate-700">
              Department (optional)
            </label>
            <input
              value={department ?? ""}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Engineering, Sales, GTM…"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Used for auto-assignment when department matches.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Role / title (optional)
            </label>
            <input
              value={role ?? ""}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Software Engineer, AE, People Partner…"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Used for auto-assignment when title matches.
            </p>
          </div>

          <div className="flex flex-col justify-end">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              Make this a default template
            </label>
            <p className="mt-1 text-[11px] text-slate-400">
              Applied to all new hires in addition to any department/role
              templates.
            </p>
          </div>
        </div>
      </div>

      {/* Tasks editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Tasks in this template
            </h2>
            <p className="text-[11px] text-slate-500">
              Tasks are created as onboarding checklist items when this template
              is applied.
            </p>
          </div>
          <button
            type="button"
            onClick={addTask}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            + Add task
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
            No tasks yet. Add tasks to define this onboarding template.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-slate-50">
                        {index + 1}
                      </span>
                      <input
                        required
                        value={task.title}
                        onChange={(e) =>
                          updateTask(index, { title: e.target.value })
                        }
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Task title"
                      />
                    </div>

                    <textarea
                      value={task.description ?? ""}
                      onChange={(e) =>
                        updateTask(index, { description: e.target.value })
                      }
                      rows={2}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Optional details or links for this task."
                    />
                  </div>

                  <div className="flex w-52 flex-col gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-slate-600">
                        Assignee
                      </label>
                      <select
                        value={task.assigneeType ?? "EMPLOYEE"}
                        onChange={(e) =>
                          updateTask(index, {
                            assigneeType: e.target.value as AssigneeType,
                          })
                        }
                        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="HR">HR / People team</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-slate-600">
                        Due (days from start)
                      </label>
                      <input
                        type="number"
                        value={
                          task.dueRelativeDays === null ||
                          task.dueRelativeDays === undefined
                            ? ""
                            : task.dueRelativeDays
                        }
                        onChange={(e) =>
                          updateTask(index, {
                            dueRelativeDays:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. 0, 7, 30"
                      />
                      <p className="mt-1 text-[10px] text-slate-400">
                        0 = start date, negative = before start.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="self-end text-[11px] text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
        <p className="text-[11px] text-slate-400">
          Tasks will be turned into onboarding checklist items when this template
          is applied.
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-50 shadow-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {saving
            ? mode === "create"
              ? "Creating template…"
              : "Saving changes…"
            : mode === "create"
            ? "Create template"
            : "Save template"}
        </button>
      </div>
    </form>
  );
}
