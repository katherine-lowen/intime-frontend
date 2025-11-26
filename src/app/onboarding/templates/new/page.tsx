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
      const orgId =
        process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

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

      // On success, go back to the list
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
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">
              New onboarding template
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Define a reusable checklist for onboarding new hires in this role or department.
            </p>
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
                placeholder="New hire – AE, US Remote"
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
                placeholder="What is this template used for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Department (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Sales"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role / title (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Account Executive"
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

        {/* Steps builder */}
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Steps
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Define each task required to get a new hire fully onboarded.
              </p>
            </div>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-900"
            >
              + Add step
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Step {index + 1}
                  </span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-xs text-slate-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400">
                      Title
                    </label>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Welcome email, laptop ordering, system access..."
                      value={step.title}
                      onChange={(e) =>
                        updateStep(index, { title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">
                      Assignee
                    </label>
                    <select
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    <label className="block text-xs font-medium text-slate-400">
                      Description (optional)
                    </label>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Details or links the assignee needs to complete this step."
                      value={step.description}
                      onChange={(e) =>
                        updateStep(index, { description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">
                      Due (days after start)
                    </label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

        <div className="flex items-center justify-between gap-4 pt-2">
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
            {saving ? "Saving…" : "Create template"}
          </button>
        </div>
      </form>
    </div>
  );
}
