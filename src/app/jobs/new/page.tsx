// src/app/jobs/new/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import { logSubmission } from "@/lib/submissions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "PAUSED";

type ApplicationTemplate = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
};

type CreateJobPayload = {
  title: string;
  status?: JobStatus;
  location?: string | null;
  department?: string | null;
  description?: string | null;
  publishToJobBoard?: boolean;
  applicationTemplateId?: string | null;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
  compensationNotes?: string | null;
};

export default function NewJobPage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<JobStatus>("OPEN");
  const [publishToJobBoard, setPublishToJobBoard] = useState(true);
  const [templateId, setTemplateId] = useState<string>("");

  const [compMin, setCompMin] = useState<string>("");
  const [compMax, setCompMax] = useState<string>("");
  const [compCurrency, setCompCurrency] = useState<string>("USD");
  const [compNotes, setCompNotes] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Load application templates, but treat 404 as "no templates yet"
  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      setTemplatesLoading(true);
      setTemplatesError(null);

      try {
        const res = await fetch(`${API_URL}/application-templates`, {
          headers: {
            "X-Org-Id": ORG_ID,
          },
          cache: "no-store",
        });

        // No templates defined yet – that's OK, just show empty list
        if (res.status === 404) {
          if (!cancelled) {
            setTemplates([]);
            setTemplatesLoading(false);
          }
          return;
        }

        // Any other non-OK status: show soft error, don't throw
        if (!res.ok) {
          if (!cancelled) {
            console.error(
              "Failed to load application templates",
              res.status,
              res.statusText
            );
            setTemplates([]);
            setTemplatesError(
              `Couldn't load templates (HTTP ${res.status}). You can still open a role without them.`
            );
            setTemplatesLoading(false);
          }
          return;
        }

        const data = (await res.json()) as ApplicationTemplate[];
        if (!cancelled) {
          setTemplates(data);
          setTemplatesLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load application templates", e);
          setTemplatesError("Couldn't load templates (optional).");
          setTemplatesLoading(false);
        }
      }
    }

    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: CreateJobPayload = {
      title: title.trim(),
      status,
      location: location.trim() || null,
      department: department.trim() || null,
      description: description.trim() || null,
      publishToJobBoard,
      applicationTemplateId: templateId || null,
      compensationMin: compMin ? Number(compMin) : null,
      compensationMax: compMax ? Number(compMax) : null,
      compensationCurrency: compCurrency || null,
      compensationNotes: compNotes.trim() || null,
    };

    // 🔹 Log the attempt to Supabase
    await logSubmission({
      action: "create_job",
      payload,
      status: "ATTEMPTED",
    });

    try {
      const res = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": ORG_ID,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} – ${text}`);
      }

      const job = (await res.json()) as { id?: string };

      // 🔹 Log success
      await logSubmission({
        action: "create_job",
        payload,
        status: "SUCCESS",
      });

      if (job.id) {
        router.push(`/jobs/${job.id}`);
      } else {
        router.push("/jobs");
      }
    } catch (e: any) {
      console.error("Failed to create job", e);
      const message = e?.message || "Failed to create job";
      setError(message);

      // 🔹 Log failure with error message
      await logSubmission({
        action: "create_job",
        payload,
        status: "FAILED",
        error: message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGate>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-slate-50" />

        <main className="mx-auto max-w-5xl px-6 py-6 space-y-6">
          {/* Header */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                Hiring · New role
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Open a new requisition
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Capture the basics now — you can refine the description and
                application questions later.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Back to jobs
            </button>
          </section>

          {/* Form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Role title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Senior Product Designer"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Design, Marketing, GTM"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Remote (US), Miami, Hybrid"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="OPEN">Open</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PAUSED">Paused</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Job description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="What this role will own, what success looks like, key responsibilities, requirements..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <p className="text-[11px] text-slate-400">
                  You can paste an existing JD here or keep it light and refine
                  later.
                </p>
              </div>

              {/* Compensation */}
              <div className="space-y-2 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">
                    Compensation (optional)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Internal-only unless you publish it in your job board.
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">
                      Min (annual)
                    </label>
                    <input
                      type="number"
                      value={compMin}
                      onChange={(e) => setCompMin(e.target.value)}
                      placeholder="90000"
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">
                      Max (annual)
                    </label>
                    <input
                      type="number"
                      value={compMax}
                      onChange={(e) => setCompMax(e.target.value)}
                      placeholder="130000"
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={compCurrency}
                      onChange={(e) => setCompCurrency(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={compNotes}
                    onChange={(e) => setCompNotes(e.target.value)}
                    placeholder="Bonus, equity, on-target earnings, exceptions..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Application template */}
              <div className="space-y-2 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">
                    Application template
                  </span>
                  {templatesLoading && (
                    <span className="text-[11px] text-slate-500">
                      Loading templates…
                    </span>
                  )}
                </div>

                {templatesError && (
                  <p className="text-[11px] text-amber-600">
                    {templatesError}
                  </p>
                )}

                {templates.length === 0 && !templatesLoading ? (
                  <p className="text-[11px] text-slate-500">
                    No application templates yet. You can still open this role;
                    candidates will only see the basic fields (name, email).
                  </p>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">
                      Choose template (optional)
                    </label>
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">No template</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    {templateId && (
                      <p className="text-[11px] text-slate-500">
                        The selected template’s questions will appear on the
                        public application form for this role.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Publishing */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <div className="text-xs font-medium text-slate-700">
                    Publish to public job board
                  </div>
                  <div className="text-[11px] text-slate-500">
                    When enabled, this role appears on your /careers page for
                    candidates to apply.
                  </div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={publishToJobBoard}
                    onChange={(e) => setPublishToJobBoard(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700">Publish</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/jobs")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving ? "Opening…" : "Open requisition"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </AuthGate>
  );
}
