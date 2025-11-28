// src/app/timeoff/policies/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";

type TimeOffPolicyKind = "UNLIMITED" | "FIXED";

type TimeOffPolicy = {
  id: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays?: number | null;
  createdAt?: string;
};

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function formatKind(kind: TimeOffPolicyKind) {
  if (kind === "UNLIMITED") return "Unlimited";
  if (kind === "FIXED") return "Fixed allowance";
  return kind;
}

export default function TimeOffPoliciesPage() {
  const [policies, setPolicies] = useState<TimeOffPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [kind, setKind] = useState<TimeOffPolicyKind>("UNLIMITED");
  const [annualAllowanceDays, setAnnualAllowanceDays] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isFixed = kind === "FIXED";

  async function fetchPolicies() {
    try {
      setLoading(true);
      setLoadError(null);

      const res = await fetch(`${API_URL}/timeoff/policies`, {
        headers: {
          "x-org-id": ORG_ID,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to load time off policies:", res.status, text);
        throw new Error(`Failed to load policies: ${res.status}`);
      }

      const data = (await res.json()) as TimeOffPolicy[];
      setPolicies(data);
    } catch (e: any) {
      setLoadError(e?.message || "Failed to load policies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchPolicies();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);

    if (!name.trim()) {
      setSaveError("Policy name is required.");
      return;
    }

    let allowance: number | null | undefined = undefined;

    if (isFixed) {
      if (!annualAllowanceDays.trim()) {
        setSaveError("Annual allowance is required for fixed policies.");
        return;
      }
      const parsed = Number(annualAllowanceDays);
      if (Number.isNaN(parsed) || parsed <= 0) {
        setSaveError("Annual allowance must be a positive number.");
        return;
      }
      allowance = parsed;
    } else {
      allowance = null;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/timeoff/policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": ORG_ID,
        },
        body: JSON.stringify({
          name: name.trim(),
          kind,
          annualAllowanceDays: allowance,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create time off policy failed:", res.status, text);
        throw new Error(`Create failed: ${res.status}`);
      }

      // Clear form
      setName("");
      setKind("UNLIMITED");
      setAnnualAllowanceDays("");

      // Refresh list
      await fetchPolicies();
    } catch (e: any) {
      setSaveError(e?.message || "Failed to create time off policy.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGate>
      <main className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Time off policies
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Configure PTO rules for your organization, including unlimited and
              fixed allowance plans.
            </p>
          </div>
        </div>

        {/* Create policy form */}
        <form
          onSubmit={handleCreate}
          className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              New time off policy
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Create a PTO policy such as &ldquo;Unlimited PTO&rdquo; or
              &ldquo;15 days per year&rdquo;.
            </p>
          </div>

          {saveError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {saveError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                Policy name
              </label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Unlimited PTO"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                  Policy type
                </label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={kind}
                  onChange={(e) =>
                    setKind(e.target.value as TimeOffPolicyKind)
                  }
                >
                  <option value="UNLIMITED">Unlimited</option>
                  <option value="FIXED">Fixed allowance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
                  Annual allowance (days)
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder={isFixed ? "15" : "Not applicable"}
                  value={annualAllowanceDays}
                  onChange={(e) => setAnnualAllowanceDays(e.target.value)}
                  disabled={!isFixed}
                />
                <p className="mt-1 text-xs text-slate-500">
                  For unlimited policies, employees won&apos;t see a balance
                  limit.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create policy"}
            </button>
          </div>
        </form>

        {/* Policies list */}
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Existing policies
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              These policies control how employees accrue and request time off.
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm">
              Loading policies…
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700 shadow-sm">
              {loadError}
            </div>
          ) : policies.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm">
              No policies yet. Use the form above to create your first one.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Policy
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Annual allowance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {policies.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm">
                        <span className="font-medium text-slate-900">
                          {p.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {formatKind(p.kind)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {p.kind === "UNLIMITED" ? (
                          <span className="text-xs font-medium text-emerald-700">
                            Unlimited
                          </span>
                        ) : p.annualAllowanceDays != null ? (
                          <span className="text-xs text-slate-700">
                            {p.annualAllowanceDays} days / year
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-right">
                        <span className="text-xs text-slate-400">—</span>
                        {/* future: edit / delete actions */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </AuthGate>
  );
}
