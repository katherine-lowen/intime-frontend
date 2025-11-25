// src/app/onboarding/templates/new/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type TemplateTask = {
  title: string;
  description?: string | null;
  assigneeType: "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";
  dueRelativeDays?: number | null;
};

type CreatedTemplate = {
  id: string;
};

const ASSIGNEE_OPTIONS: TemplateTask["assigneeType"][] = [
  "EMPLOYEE",
  "MANAGER",
  "HR",
  "OTHER",
];

function emptyTask(): TemplateTask {
  return {
    title: "",
    description: "",
    assigneeType: "EMPLOYEE",
    dueRelativeDays: 0,
  };
}

function toIntOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function NewOnboardingTemplateInner() {
  const router = useRouter();

  // Template metadata
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // AI prompt fields
  const [aiSeniority, setAiSeniority] = useState("Mid-level");
  const [aiLocation, setAiLocation] = useState("Remote / hybrid");
  const [aiTone, setAiTone] = useState(
    "Friendly, fast-moving SaaS company that cares about autonomy and context."
  );

  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/ai-onboarding-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleTitle: role || name,
          department: department || undefined,
          seniority: aiSeniority || undefined,
          location: aiLocation || undefined,
          companyTone: aiTone || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI template error", res.status, text);
        throw new Error("Failed to generate template from AI");
      }

      const data = (await res.json()) as { tasks: TemplateTask[] };
      if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
        setError("AI did not return any tasks. Try adjusting the prompt.");
      } else {
        setTasks(data.tasks);
      }
    } catch (err: any) {
      console.error("AI generate error", err);
      setError(
        err?.message || "Something went wrong generating the template with AI."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!name.trim()) {
        setError("Template name is required.");
        setSaving(false);
        return;
      }

      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        department: department.trim() || undefined,
        role: role.trim() || undefined,
        isDefault,
        tasks: tasks.map((t) => ({
          title: t.title.trim(),
          description: t.description?.toString().trim() || undefined,
          assigneeType: t.assigneeType,
          dueRelativeDays:
            typeof t.dueRelativeDays === "number" ? t.dueRelativeDays : null,
        })),
      };

      const created = await api.post<CreatedTemplate>(
        "/onboarding/templates",
        body
      );

      router.push(`/onboarding/templates/${created.id}`);
    } catch (err: any) {
      console.error("Save template error", err);
      setError(
        err?.message || "Failed to save template. Please try again in a moment."
      );
    } finally {
      setSaving(false);
    }
  }

  function updateTask(index: number, patch: Partial<TemplateTask>) {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );
  }

  function addTask() {
    setTasks((prev) => [...prev, emptyTask()]);
  }

  function removeTask(index: number) {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveTask(index: number, direction: "up" | "down") {
    setTasks((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/onboarding/templates"
            className="text-xs text-indigo-600 hover:underline"
          >
            ← Back to templates
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            New onboarding template
          </h1>
          <p className="text-sm text-slate-600">
            Use AI to draft a 30-day onboarding checklist, then fine-tune tasks
            before saving as a reusable template.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={addTask}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            ➕ Add manual task
          </button>
          <button
            type="submit"
            form="new-template-form"
            disabled={saving}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save template"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <form
        id="new-template-form"
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]"
      >
        {/* LEFT: Template meta + AI prompt */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Template details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Give this template a clear name and scope so it’s easy to reuse.
            </p>

            <div className="mt-3 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Template name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Standard Engineering Onboarding (30 days)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="30-day onboarding plan for new engineers in the core product team."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Engineering, Sales, Design…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Role / title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Software Engineer, AE, Designer…"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Make this the default template for this role/department
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-slate-800 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Generate tasks with AI
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Describe the role and what a great first month looks like. Intime
              will draft a full checklist of tasks you can edit.
            </p>

            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700">
                    Seniority
                  </label>
                  <input
                    type="text"
                    value={aiSeniority}
                    onChange={(e) => setAiSeniority(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Junior, Mid-level, Senior…"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700">
                    Location / context
                  </label>
                  <input
                    type="text"
                    value={aiLocation}
                    onChange={(e) => setAiLocation(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Remote, hybrid, HQ-based…"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700">
                  Company tone & focus
                </label>
                <textarea
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="E.g. We move fast, value ownership, and want new hires to build relationships early."
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="mt-2 inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
              >
                {generating ? "Generating from AI…" : "✨ Generate tasks with AI"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Tasks editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Template tasks
            </h2>
            <span className="text-[11px] text-slate-500">
              {tasks.length} task{tasks.length === 1 ? "" : "s"}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-xs text-slate-500">
              No tasks yet. Use{" "}
              <span className="font-medium">“Generate tasks with AI”</span> or
              add tasks manually to build your onboarding template.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      Task {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveTask(index, "up")}
                        className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTask(index, "down")}
                        className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500 hover:bg-slate-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-red-500 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700">
                        Title
                      </label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) =>
                          updateTask(index, { title: e.target.value })
                        }
                        className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Meet your manager"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700">
                        Description
                      </label>
                      <textarea
                        value={task.description ?? ""}
                        onChange={(e) =>
                          updateTask(index, { description: e.target.value })
                        }
                        rows={2}
                        className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="30–45 minute 1:1 to align on expectations, communication preferences, and the first week’s priorities."
                      />
                    </div>

                    <div className="grid grid-cols-[1.2fr_0.8fr] gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700">
                          Assignee
                        </label>
                        <select
                          value={task.assigneeType}
                          onChange={(e) =>
                            updateTask(index, {
                              assigneeType: e.target
                                .value as TemplateTask["assigneeType"],
                            })
                          }
                          className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {ASSIGNEE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt === "EMPLOYEE"
                                ? "Employee"
                                : opt === "MANAGER"
                                ? "Manager"
                                : opt === "HR"
                                ? "HR / People"
                                : "Other"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700">
                          Days from start
                        </label>
                        <input
                          type="number"
                          value={
                            task.dueRelativeDays !== null &&
                            task.dueRelativeDays !== undefined
                              ? String(task.dueRelativeDays)
                              : ""
                          }
                          onChange={(e) =>
                            updateTask(index, {
                              dueRelativeDays: toIntOrNull(e.target.value),
                            })
                          }
                          className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </main>
  );
}

export default function NewOnboardingTemplatePage() {
  return (
    <AuthGate>
      <NewOnboardingTemplateInner />
    </AuthGate>
  );
}
