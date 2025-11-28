// src/app/jobs/[id]/edit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

type JobStatus = "OPEN" | "DRAFT" | "CLOSED" | "PAUSED";

type Job = {
  id: string;
  title: string;
  status: JobStatus;
  department?: string | null;
  location?: string | null;
  description?: string | null;

  // new fields
  publishToJobBoard?: boolean;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
  compensationNotes?: string | null;
  applicationTemplateId?: string | null;
};

type ApplicationTemplate = {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export default function EditJobPage() {
  const params = useParams();
  const id = useMemo(
    () => String((params as Record<string, string>).id ?? ""),
    [params]
  );
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form fields
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<JobStatus>("OPEN");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [publishToJobBoard, setPublishToJobBoard] = useState(false);
  const [compMin, setCompMin] = useState<string>("");
  const [compMax, setCompMax] = useState<string>("");
  const [compCurrency, setCompCurrency] = useState("USD");
  const [compNotes, setCompNotes] = useState("");

  const [applicationTemplateId, setApplicationTemplateId] =
    useState<string>("");

  // templates
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);

  // Load job
  useEffect(() => {
    if (!id) return;

    async function loadJob() {
      setErr(null);
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/jobs/${id}`, {
          headers: {
            "X-Org-Id": ORG_ID,
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const j: Job & { createdAt?: string } = await res.json();

        setTitle(j.title ?? "");
        setStatus((j.status as JobStatus) ?? "OPEN");
        setDepartment(j.department ?? "");
        setLocation(j.location ?? "");
        setDescription(j.description ?? "");

        setPublishToJobBoard(Boolean(j.publishToJobBoard));
        setCompMin(
          j.compensationMin != null ? String(j.compensationMin) : ""
        );
        setCompMax(
          j.compensationMax != null ? String(j.compensationMax) : ""
        );
        setCompCurrency(j.compensationCurrency || "USD");
        setCompNotes(j.compensationNotes ?? "");
        setApplicationTemplateId(j.applicationTemplateId ?? "");
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Failed to load job");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [id]);

  // Load application templates (same endpoint semantics as /jobs/new)
  useEffect(() => {
    let cancelled = false;

    async function loadTemplates() {
      setLoadingTemplates(true);
      setTemplatesError(null);

      try {
        const res = await fetch(`${API_URL}/application-templates`, {
          headers: {
            "X-Org-Id": ORG_ID,
          },
          cache: "no-store",
        });

        // Treat 404 as “no templates yet”
        if (res.status === 404) {
          if (!cancelled) {
            setTemplates([]);
            setLoadingTemplates(false);
          }
          return;
        }

        if (!res.ok) {
          if (!cancelled) {
            console.error(
              "Failed to load application templates",
              res.status,
              res.statusText
            );
            setTemplates([]);
            setTemplatesError(
              `Couldn't load templates (HTTP ${res.status}). You can still edit the role without them.`
            );
            setLoadingTemplates(false);
          }
          return;
        }

        const data = (await res.json()) as ApplicationTemplate[];
        if (!cancelled) {
          setTemplates(data);
          setLoadingTemplates(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load application templates", e);
          setTemplatesError("Couldn't load templates (optional).");
          setLoadingTemplates(false);
        }
      }
    }

    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    setErr(null);

    if (!title.trim()) {
      setErr("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const body: any = {
        title: title.trim(),
        status,
        department: department.trim() || null,
        location: location.trim() || null,
        description: description.trim() || null,
        publishToJobBoard,
        compensationCurrency: compCurrency || null,
        compensationNotes: compNotes.trim() || null,
      };

      const minNum = compMin ? Number(compMin) : NaN;
      const maxNum = compMax ? Number(compMax) : NaN;

      if (!Number.isNaN(minNum)) body.compensationMin = minNum;
      else body.compensationMin = null;

      if (!Number.isNaN(maxNum)) body.compensationMax = maxNum;
      else body.compensationMax = null;

      if (applicationTemplateId) {
        body.applicationTemplateId = applicationTemplateId;
      } else {
        body.applicationTemplateId = null;
      }

      const res = await fetch(`${API_URL}/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": ORG_ID,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${txt}`);
      }

      router.push(`/jobs/${id}`);
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGate>
      <main className="space-y-6 px-6 py-6">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              Hiring · Jobs
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Edit job
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Update details for this opening. Changes flow through to the
              public job board and ATS.
            </p>
          </div>

          <Link
            href={`/jobs/${id}`}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Back to job
          </Link>
        </section>

        {loading && (
          <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            Loading…
          </div>
        )}

        {!loading && (
          <form
            onSubmit={onSubmit}
            className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]"
          >
            {/* LEFT: core job + description */}
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Role details
                </h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Job title<span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Backend Engineer"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Department
                    </label>
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Engineering"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Location
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote (US), Miami, FL"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as JobStatus)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="OPEN">Open</option>
                      <option value="DRAFT">Draft</option>
                      <option value="PAUSED">Paused</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Job description (public)
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  This is what candidates see on your public job board.
                </p>
                <div className="mt-3">
                  <textarea
                    className="min-h-[160px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="High-level overview, responsibilities, requirements, and what makes this role unique."
                  />
                </div>
              </div>
            </section>

            {/* RIGHT: comp, job board, template */}
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Compensation
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Optional, but recommended for transparency on the job board.
                </p>

                <div className="mt-3 grid gap-3 text-sm">
                  <div className="grid grid-cols-[1.1fr_1.1fr_0.8fr] gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Min
                      </label>
                      <input
                        value={compMin}
                        onChange={(e) => setCompMin(e.target.value)}
                        placeholder="90000"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Max
                      </label>
                      <input
                        value={compMax}
                        onChange={(e) => setCompMax(e.target.value)}
                        placeholder="130000"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Currency
                      </label>
                      <input
                        value={compCurrency}
                        onChange={(e) => setCompCurrency(e.target.value)}
                        placeholder="USD"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={compNotes}
                      onChange={(e) => setCompNotes(e.target.value)}
                      placeholder="e.g. Base only, bonus & equity separate; varies by location."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Public job board & questions
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Control whether this role appears on your public careers page,
                  and which application template is used.
                </p>

                <div className="mt-3 space-y-3 text-sm">
                  <label className="inline-flex items-start gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={publishToJobBoard}
                      onChange={(e) => setPublishToJobBoard(e.target.checked)}
                      className="mt-[2px] h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      Publish to public job board
                      <span className="block text-[11px] text-slate-500">
                        When enabled and status is OPEN, this role appears on
                        your /careers page.
                      </span>
                    </span>
                  </label>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Application template
                      </label>
                      {loadingTemplates && (
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

                    <select
                      value={applicationTemplateId}
                      onChange={(e) => setApplicationTemplateId(e.target.value)}
                      disabled={loadingTemplates || templates.length === 0}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    >
                      <option value="">
                        {loadingTemplates
                          ? "Loading templates…"
                          : templates.length === 0
                          ? "No templates yet"
                          : "No additional questions"}
                      </option>
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Manage templates under Hiring → Templates.
                    </p>
                  </div>
                </div>
              </div>

              {err && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                  {err}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </section>
          </form>
        )}
      </main>
    </AuthGate>
  );
}
