// src/app/jobs/new/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import { logSubmission } from "@/lib/submissions";
import {
  Briefcase,
  ChevronLeft,
  DollarSign,
  Layers,
  Globe,
  Bold,
  List,
  Link as LinkIcon,
  FileText,
} from "lucide-react";

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
  const searchParams = useSearchParams();

  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<JobStatus>("OPEN");
  const [publishToJobBoard, setPublishToJobBoard] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");

  const [compMin, setCompMin] = useState<string>("");
  const [compMax, setCompMax] = useState<string>("");
  const [compCurrency, setCompCurrency] = useState<string>("USD");
  const [compNotes, setCompNotes] = useState<string>("");

  const [compAILoading, setCompAILoading] = useState(false);
  const [compAIError, setCompAIError] = useState<string | null>(null);
  const [compAIRationale, setCompAIRationale] = useState<string | null>(null);

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

        if (res.status === 404) {
          if (!cancelled) {
            setTemplates([]);
            setTemplatesLoading(false);
          }
          return;
        }

        if (!res.ok) {
          if (!cancelled) {
            console.error(
              "Failed to load application templates",
              res.status,
              res.statusText,
            );
            setTemplates([]);
            setTemplatesError(
              `Couldn't load templates (HTTP ${res.status}). You can still open a role without them.`,
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

  // 🔹 If we arrive from the AI JD tool, prefill from localStorage draft
  useEffect(() => {
    const source = searchParams?.get("source");
    if (source !== "ai-jd") return;
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("intime_ai_jd_draft");
      if (!raw) return;

      const draft = JSON.parse(raw) as {
        title?: string;
        description?: string;
        department?: string;
        seniority?: string;
        location?: string;
      };

      if (draft.title) {
        setTitle((prev) => prev || draft.title || "");
      }
      if (draft.department) {
        setDepartment((prev) => prev || draft.department || "");
      }
      if (draft.location) {
        setLocation((prev) => prev || draft.location || "");
      }
      if (draft.description) {
        setDescription((prev) => prev || draft.description || "");
      }

      window.localStorage.removeItem("intime_ai_jd_draft");
    } catch (err) {
      console.error("Failed to load AI JD draft", err);
    }
  }, [searchParams]);

  const isFormValid = title.trim().length > 0;

  const compensationPreview = (() => {
    if (!compMin && !compMax) return null;
    const min = compMin ? `$${Number(compMin).toLocaleString()}` : "";
    const max = compMax ? `$${Number(compMax).toLocaleString()}` : "";
    if (min && max) return `${min}–${max} ${compCurrency}`;
    if (min) return `${min}+ ${compCurrency}`;
    if (max) return `Up to ${max} ${compCurrency}`;
    return null;
  })();

  async function handleAICompensation() {
    if (!title && !description) {
      setCompAIError("Add a role title or description first.");
      return;
    }

    setCompAILoading(true);
    setCompAIError(null);
    setCompAIRationale(null);

    try {
      const res = await fetch("/api/ai/compensation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          location,
          department,
          description,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} – ${text}`);
      }

      const data = (await res.json()) as {
        min?: number;
        max?: number;
        currency?: string;
        rationale?: string;
      };

      if (data.min != null) setCompMin(String(Math.round(data.min)));
      if (data.max != null) setCompMax(String(Math.round(data.max)));
      if (data.currency) setCompCurrency(data.currency.toUpperCase());
      if (data.rationale) setCompAIRationale(data.rationale);
    } catch (e: any) {
      console.error("AI compensation error", e);
      setCompAIError(e?.message || "Failed to fetch AI range.");
    } finally {
      setCompAILoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

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

      const job = await res.json();
      console.log("Created job response:", job);

      await logSubmission({
        action: "create_job",
        payload,
        status: "SUCCESS",
      });

      router.push("/jobs");
    } catch (e: any) {
      console.error("Failed to create job", e);
      const message = e?.message || "Failed to create job";
      setError(message);

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
      <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Hero Header */}
        <header className="border-b border-slate-200/70 bg-white/80 pt-10 pb-6 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-start justify-between px-6">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="tracking-wide">Hiring · New role</span>
              </div>
              <h1 className="mb-2 text-[26px] font-semibold tracking-tight text-slate-900">
                Create a new job requisition
              </h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Define the essentials now — refine details and publish when
                ready.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to jobs
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-5xl space-y-6 px-6 pb-28 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Role details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Role details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define the fundamentals of this role.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1">
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

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Product & Design"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="text-[11px] text-slate-400">
                    Optional — helps with role categorization.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco · Remote OK"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="text-[11px] text-slate-400">
                    Optional — specify office or remote policy.
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-2 pt-1">
                  <label className="text-xs font-medium text-slate-700">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      ["DRAFT", "Draft"],
                      ["OPEN", "Open"],
                      ["PAUSED", "Paused"],
                      ["CLOSED", "Closed"],
                    ] as [JobStatus, string][]).map(([value, label]) => {
                      const active = status === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setStatus(value)}
                          className={[
                            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                            active
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Job description */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Job description
                  </h2>
                  <p className="text-xs text-slate-500">
                    Provide a clear overview of the role.
                  </p>
                </div>
              </div>

              {/* mini toolbar (visual only) */}
              <div className="mb-3 flex items-center gap-1 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                <span className="ml-2 text-xs text-slate-400">
                  Rich text formatting (coming soon)
                </span>
              </div>

              <div className="space-y-1">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Paste an existing job description or write a summary of responsibilities, requirements, and what makes this role unique..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <p className="text-[11px] text-slate-400">
                  You can refine this later before publishing to your careers
                  page.
                </p>
              </div>
            </section>

            {/* Compensation */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Compensation
                      <span className="ml-2 text-[11px] font-normal uppercase tracking-wide text-slate-400">
                        Optional
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Internal-only unless you publish it to your job board.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAICompensation}
                  disabled={compAILoading}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {compAILoading ? "Asking AI…" : "Use AI market range"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Min (annual)
                  </label>
                  <input
                    type="number"
                    value={compMin}
                    onChange={(e) => setCompMin(e.target.value)}
                    placeholder="90000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Max (annual)
                  </label>
                  <input
                    type="number"
                    value={compMax}
                    onChange={(e) => setCompMax(e.target.value)}
                    placeholder="130000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={compCurrency}
                    onChange={(e) => setCompCurrency(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {compensationPreview && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Range preview:</span>
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                    {compensationPreview}
                  </span>
                </div>
              )}

              {compAIRationale && (
                <p className="mt-2 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">
                    AI rationale:
                  </span>{" "}
                  {compAIRationale}
                </p>
              )}

              {compAIError && (
                <p className="mt-2 text-[11px] text-rose-600">
                  {compAIError}
                </p>
              )}

              <div className="mt-4 space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Additional notes
                </label>
                <textarea
                  rows={3}
                  value={compNotes}
                  onChange={(e) => setCompNotes(e.target.value)}
                  placeholder="Includes equity, bonus, benefits..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <p className="text-[11px] text-slate-400">
                  Optional — add context about equity, bonuses, or benefits.
                </p>
              </div>
            </section>

            {/* Application template */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Layers className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    Application template
                  </span>
                  {templatesLoading && (
                    <span className="text-slate-500">
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
                    <select
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">
                        No template — basic fields only
                      </option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Templates add structured questions to your application
                      form.
                    </p>
                    {templateId && (
                      <p className="text-[11px] text-slate-500">
                        The selected template’s questions will appear on the
                        public application form for this role.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Publishing */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Publishing settings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control visibility on your public careers page.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
                <label className="mt-1 inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={publishToJobBoard}
                    onChange={(e) =>
                      setPublishToJobBoard(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    Publish to public job board
                  </div>
                  <div className="mt-1 text-[13px] text-slate-600">
                    When enabled, this role appears on your public{" "}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">
                      /careers
                    </span>{" "}
                    page for candidates to apply.
                  </div>
                </div>
              </div>
            </section>

            {/* Spacer for sticky footer */}
            <div className="h-8" />
          </form>
        </main>

        {/* Sticky footer actions */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <p className="text-xs text-slate-600">
              {isFormValid
                ? "Ready to create this requisition."
                : "Fill in a role title to create this requisition."}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="" // uses the nearest form ancestor
                onClick={(e) => {
                  const form = (e.currentTarget.closest("form") ??
                    document.querySelector("form")) as HTMLFormElement | null;
                  if (form) {
                    form.dispatchEvent(
                      new Event("submit", {
                        bubbles: true,
                        cancelable: true,
                      }),
                    );
                  }
                }}
                disabled={!isFormValid || saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? "Creating requisition…" : "Create job"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
