// src/app/onboarding/templates/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AssigneeType = "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";

type Step = {
  title: string;
  description: string;
  assigneeType: AssigneeType;
  dueRelativeDays: string; // keep as string in state, convert to number/null on submit
};

const DEFAULT_STEP: Step = {
  title: "",
  description: "",
  assigneeType: "EMPLOYEE",
  dueRelativeDays: "",
};

export default function NewOnboardingTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [steps, setSteps] = useState<Step[]>([{ ...DEFAULT_STEP }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateStep(index: number, patch: Partial<Step>) {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addStep() {
    setSteps((prev) => [...prev, { ...DEFAULT_STEP }]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }

    const cleanedSteps = steps
      .map((s) => ({
        title: s.title.trim(),
        description: s.description.trim() || undefined,
        assigneeType: s.assigneeType,
        dueRelativeDays:
          s.dueRelativeDays.trim() === ""
            ? null
            : Number.isNaN(Number(s.dueRelativeDays))
            ? null
            : Number(s.dueRelativeDays),
      }))
      .filter((s) => s.title.length > 0);

    if (cleanedSteps.length === 0) {
      setError("Add at least one step to the template.");
      return;
    }

    setSaving(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

      const res = await fetch(`${baseUrl}/onboarding/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": orgId,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          department: department.trim() || undefined,
          role: role.trim() || undefined,
          isDefault,
          steps: cleanedSteps,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create onboarding template failed:", res.status, text);
        throw new Error(`Create failed: ${res.status}`);
      }

      router.push("/onboarding/templates");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create template.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              New onboarding template
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Define a reusable checklist for onboarding new hires in this role
              or department.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Template details */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Template name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="New hire – AE, US Remote"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Description
              </label>
              <textarea
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
                placeholder="What is this template used for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                  Department (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Sales"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                  Role / title (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Account Executive"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>

            <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <span>Set as default onboarding template</span>
            </label>

            <p className="text-xs text-slate-500">
              Default templates can be auto-suggested for new hires in this
              department or role.
            </p>
          </div>
        </div>

        {/* Steps builder */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Steps</h2>
              <p className="mt-1 text-xs text-slate-600">
                Define each task required to get a new hire fully onboarded.
              </p>
            </div>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              + Add step
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Step {index + 1}
                  </span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-xs text-slate-500 hover:text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Title
                    </label>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Welcome email, laptop ordering, system access..."
                      value={step.title}
                      onChange={(e) =>
                        updateStep(index, { title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Assignee
                    </label>
                    <select
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={step.assigneeType}
                      onChange={(e) =>
                        updateStep(index, {
                          assigneeType: e.target.value as AssigneeType,
                        })
                      }
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="HR">HR</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Description (optional)
                    </label>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Details or links the assignee needs to complete this step."
                      value={step.description}
                      onChange={(e) =>
                        updateStep(index, { description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Due (days after start)
                    </label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="0"
                      value={step.dueRelativeDays}
                      onChange={(e) =>
                        updateStep(index, { dueRelativeDays: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.push("/onboarding/templates")}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create template"}
          </button>
        </div>
      </form>
    </div>
  );
}
