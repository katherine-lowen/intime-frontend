// src/app/settings/timeoff/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

type PolicyKind = "UNLIMITED" | "FIXED" | "ACCRUAL";

type TimeOffPolicy = {
  id: string;
  name: string;
  kind: PolicyKind;
  annualAllowanceDays?: number | null;
  createdAt?: string;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

export const dynamic = "force-dynamic";

export default function TimeoffSettingsPage() {
  const [policies, setPolicies] = useState<TimeOffPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("Standard PTO");
  const [kind, setKind] = useState<PolicyKind>("FIXED");
  const [annualDays, setAnnualDays] = useState<string>("15");

  async function loadPolicies() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<TimeOffPolicy[]>("/timeoff/policies");
      setPolicies(data);

      // Prefill form from first policy if one exists
      if (data.length > 0) {
        const p = data[0];
        setEditingId(p.id);
        setName(p.name);
        setKind(p.kind);
        setAnnualDays(
          p.kind === "FIXED" || p.kind === "ACCRUAL"
            ? String(p.annualAllowanceDays ?? 15)
            : "",
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load PTO policies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPolicies();
  }, []);

  function resetFormToNew() {
    setEditingId(null);
    setName("Standard PTO");
    setKind("FIXED");
    setAnnualDays("15");
    setError(null);
    setSuccess(null);
  }

  function startEditing(policy: TimeOffPolicy) {
    setEditingId(policy.id);
    setName(policy.name);
    setKind(policy.kind);
    setAnnualDays(
      policy.kind === "FIXED" || policy.kind === "ACCRUAL"
        ? String(policy.annualAllowanceDays ?? 15)
        : "",
    );
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Policy name is required.");
      return;
    }

    if (kind === "FIXED" || kind === "ACCRUAL") {
      const n = Number(annualDays);
      if (!Number.isFinite(n) || n < 0) {
        setError("Annual days must be a non-negative number.");
        return;
      }
    }

    try {
      setSaving(true);

      const payload: any = {
        name: name.trim(),
        kind,
      };

      if (kind === "FIXED" || kind === "ACCRUAL") {
        payload.annualAllowanceDays = Number(annualDays || "0");
      }

      if (editingId) {
        await api.patch(`/timeoff/policies/${editingId}`, payload);
      } else {
        await api.post("/timeoff/policies", payload);
      }

      setSuccess("PTO policy saved.");
      await loadPolicies();
    } catch (err) {
      console.error(err);
      setError("Failed to save PTO policy.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-6">
      {/* HEADER */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Time off settings
          </h1>
          <p className="text-sm text-slate-600">
            Define how PTO is handled at your company — unlimited vs fixed
            policies and annual allowances.
          </p>
        </div>

        <Link
          href="/timeoff"
          className="text-xs text-indigo-600 hover:underline"
        >
          View approvals →
        </Link>
      </section>

      {/* ALERTS */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {/* LAYOUT */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        {/* FORM CARD */}
        <div className="card px-5 py-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="section-title">
                {editingId ? "Edit PTO policy" : "Create PTO policy"}
              </h2>
              <p className="text-xs text-slate-500">
                Start with a single org-wide policy. Later you can add more
                nuanced rules.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetFormToNew}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
              >
                New policy
              </button>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="field-label">
                Policy name
              </label>
              <input
                id="name"
                name="name"
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Standard PTO"
              />
              <p className="text-[11px] text-slate-500">
                Examples: &quot;Standard PTO&quot;, &quot;Unlimited PTO&quot;,
                &quot;Hourly PTO&quot;.
              </p>
            </div>

            {/* Policy type */}
            <div className="space-y-1">
              <label className="field-label">Policy type</label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setKind("FIXED")}
                  className={[
                    "rounded-full border px-3 py-1",
                    kind === "FIXED"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Fixed days per year
                </button>
                <button
                  type="button"
                  onClick={() => setKind("UNLIMITED")}
                  className={[
                    "rounded-full border px-3 py-1",
                    kind === "UNLIMITED"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Unlimited PTO
                </button>
                <button
                  type="button"
                  onClick={() => setKind("ACCRUAL")}
                  className={[
                    "rounded-full border px-3 py-1",
                    kind === "ACCRUAL"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Accrual-based
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Fixed: lump sum per year. Unlimited: no strict cap.
                Accrual: earned over time (e.g. X days per month).
              </p>
            </div>

            {/* Annual days for FIXED / ACCRUAL */}
            {(kind === "FIXED" || kind === "ACCRUAL") && (
              <div className="space-y-1">
                <label htmlFor="annualDays" className="field-label">
                  Annual allowance (days)
                </label>
                <input
                  id="annualDays"
                  name="annualDays"
                  type="number"
                  min={0}
                  step={0.5}
                  className="field-input max-w-[160px]"
                  value={annualDays}
                  onChange={(e) => setAnnualDays(e.target.value)}
                />
                <p className="text-[11px] text-slate-500">
                  Total paid days off per year. For accrual, this represents the
                  target yearly amount.
                </p>
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-xs"
              >
                {saving
                  ? "Saving…"
                  : editingId
                  ? "Save changes"
                  : "Create policy"}
              </button>
            </div>
          </form>
        </div>

        {/* EXISTING POLICIES CARD */}
        <div className="card px-5 py-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="section-title">Existing policies</h2>
              <p className="text-xs text-slate-500">
                These policies are referenced when employees request time off.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="py-4 text-xs text-slate-500">Loading policies…</p>
          ) : policies.length === 0 ? (
            <p className="py-4 text-xs text-slate-500">
              No PTO policies yet. Create one on the left to get started.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {policies.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => startEditing(p)}
                  className={[
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition",
                    editingId === p.id
                      ? "border-indigo-400 bg-indigo-50/80"
                      : "border-slate-200 bg-slate-50/80 hover:bg-slate-100",
                  ].join(" ")}
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {p.kind === "UNLIMITED"
                        ? "Unlimited PTO"
                        : p.kind === "ACCRUAL"
                        ? `${
                            p.annualAllowanceDays ?? "—"
                          } days/year (accrual)`
                        : p.annualAllowanceDays != null
                        ? `${p.annualAllowanceDays} days/year`
                        : "Fixed allowance"}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    {p.createdAt && (
                      <div>Created {formatDate(p.createdAt)}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
