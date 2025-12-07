// src/app/timeoff/policies/new/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import { API_BASE_URL } from "@/lib/api";

type TimeOffPolicyKind = "UNLIMITED" | "FIXED";

const ORG = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function NewTimeOffPolicyPage() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<TimeOffPolicyKind>("UNLIMITED");
  const [allowanceDays, setAllowanceDays] = React.useState<string>("");

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Policy name is required.");
      return;
    }

    if (kind === "FIXED" && !allowanceDays.trim()) {
      setError("Enter an annual allowance in days.");
      return;
    }

    let annualAllowanceDays: number | null = null;
    if (kind === "FIXED") {
      const parsed = Number(allowanceDays);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError("Annual allowance must be a positive number of days.");
        return;
      }
      annualAllowanceDays = parsed;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/timeoff/policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": ORG,
        },
        body: JSON.stringify({
          name: name.trim(),
          kind,
          annualAllowanceDays,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Create failed: HTTP ${res.status} ${text}`);
      }

      router.push("/timeoff/policies");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to create time off policy", err);
      setError(err?.message || "Failed to create policy.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGate>
      <main className="mx-auto max-w-lg px-6 py-8">
        <header className="mb-6">
          <p className="text-xs text-slate-400">Time off · Policies</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            New time off policy
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Mirror the PTO rules you already use today. You can assign employees
            to this policy from their profile.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Policy name<span className="text-rose-500">*</span>
            </label>
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Example: US Full-time PTO"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Policy type
            </label>
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={kind}
              onChange={(e) => setKind(e.target.value as TimeOffPolicyKind)}
            >
              <option value="UNLIMITED">Unlimited PTO</option>
              <option value="FIXED">Fixed annual allowance</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Unlimited policies don&apos;t track a balance; fixed policies
              track an annual allowance in days.
            </p>
          </div>

          {kind === "FIXED" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Annual allowance (days)
              </label>
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. 15"
                value={allowanceDays}
                onChange={(e) => setAllowanceDays(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Example: 15 days = 3 weeks of PTO per year.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create policy"}
            </button>
          </div>
        </form>
      </main>
    </AuthGate>
  );
}
