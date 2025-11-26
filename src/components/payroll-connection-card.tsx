"use client";

import { useState } from "react";

type ProviderOption = "NONE" | "GUSTO" | "ADP" | "RIPPLING" | "DEEL" | "OTHER";

export default function PayrollConnectionCard() {
  const [provider, setProvider] = useState<ProviderOption>("NONE");
  const [companyId, setCompanyId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (provider !== "NONE" && !companyId.trim()) {
      setError("Company / account ID is required for this provider.");
      return;
    }

    // For now this is a front-end–only save.
    // We can later replace this with an API call to your backend.
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  const isConnected = provider !== "NONE";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Payroll connections
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Choose your primary payroll provider and store the identifiers you
            need to sync data from Intime.
          </p>
        </div>

        {isConnected ? (
          <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Connected ({providerLabel(provider)})
          </span>
        ) : (
          <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            Not connected
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Provider */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Provider
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderOption)}
            >
              <option value="NONE">Not connected</option>
              <option value="GUSTO">Gusto</option>
              <option value="ADP">ADP</option>
              <option value="RIPPLING">Rippling</option>
              <option value="DEEL">Deel</option>
              <option value="OTHER">Other</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              This will be the default provider for exports and integrations.
            </p>
          </div>

          {/* Company / account ID */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Company / account ID
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder={placeholderForCompanyId(provider)}
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              disabled={provider === "NONE"}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              The identifier your provider uses for this company or entity.
            </p>
          </div>

          {/* API key / OAuth note */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
              API key / OAuth connection
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Paste API key (demo only, not sent anywhere)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={provider === "NONE"}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              For now this is stored only in this browser session. We&apos;ll
              wire secure storage + OAuth in a later iteration.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-500">
            {savedAt ? (
              <>Last saved {savedAt.toLocaleTimeString()}</>
            ) : (
              <>Changes are local to this browser until we plug in the API.</>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save payroll settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

function providerLabel(p: ProviderOption) {
  switch (p) {
    case "GUSTO":
      return "Gusto";
    case "ADP":
      return "ADP";
    case "RIPPLING":
      return "Rippling";
    case "DEEL":
      return "Deel";
    case "OTHER":
      return "Other";
    case "NONE":
    default:
      return "Not connected";
  }
}

function placeholderForCompanyId(p: ProviderOption) {
  switch (p) {
    case "GUSTO":
      return "e.g. gusto_company_uuid";
    case "ADP":
      return "e.g. ADP client ID";
    case "RIPPLING":
      return "e.g. workspace slug";
    case "DEEL":
      return "e.g. Deel org ID";
    case "OTHER":
      return "Provider account identifier";
    case "NONE":
    default:
      return "Select a provider first";
  }
}
