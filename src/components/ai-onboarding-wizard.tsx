// src/components/ai-onboarding-wizard.tsx
"use client";

import { useState } from "react";

type Stats = {
  employees: number;
  teams: number;
  openRoles: number;
  events: number;
};

type AiOrgOnboardingResult = {
  orgSummary: string;
  onboardingPrinciples: string[];
  teamOverviews: {
    name: string;
    summary: string;
    strengths: string[];
    focusAreas: string[];
  }[];
  rolePlaybooks: {
    role: string;
    first30Days: string[];
    days30to60: string[];
    days60to90: string[];
  }[];
  riskAreas: string[];
  suggestedActions: string[];
};

type AiOnboardingResponse = {
  usedAi: boolean;
  snapshot: { stats: Stats };
  result: AiOrgOnboardingResult;
  error?: string;
};

type Props = {
  initialStats: Stats;
};

export default function AiOnboardingWizard({ initialStats }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedAi, setUsedAi] = useState(false);
  const [result, setResult] = useState<AiOrgOnboardingResult | null>(null);

  async function runOnboarding() {
    setLoading(true);
    setError(null);
    setStep(2);

    try {
      const res = await fetch("/api/ai-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = (await res.json()) as AiOnboardingResponse;
      setUsedAi(json.usedAi);
      setResult(json.result);
      setStep(3);
    } catch (err: any) {
      console.error("AI onboarding failed", err);
      setError(err?.message ?? "Something went wrong");
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI onboarding assistant
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Stand up a 30 / 60 / 90-day onboarding plan in minutes.
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Intime scans your people, teams, and open roles, then drafts a
            company-specific onboarding playbook you can refine and share.
          </p>
          {usedAi && (
            <p className="mt-1 text-xs text-emerald-600">
              Generated with AI using your live org data.
            </p>
          )}
          {!usedAi && result && (
            <p className="mt-1 text-xs text-amber-600">
              AI wasn&apos;t available, so this plan is based on a deterministic template.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <StepPill label="1. Scan org" active={step === 1} done={step > 1} />
          <StepPill
            label="2. Generate plan"
            active={step === 2}
            done={step > 2}
          />
          <StepPill
            label="3. Review & save"
            active={step === 3}
            done={step === 3 && !!result}
          />
        </div>
      </div>

      {/* Step content */}
      {step === 1 && (
        <section className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              1. Scan your organization
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              We&apos;ll pull a lightweight snapshot of your org from Intime –
              employees, teams, and open roles – without touching any PII
              beyond names, titles, and departments.
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <StatItem label="Employees" value={initialStats.employees} />
              <StatItem label="Teams" value={initialStats.teams} />
              <StatItem label="Open roles" value={initialStats.openRoles} />
              <StatItem label="Events recorded" value={initialStats.events} />
            </dl>

            <p className="mt-4 text-[11px] text-slate-500">
              This snapshot powers the onboarding playbook and AI summary. You
              can regenerate it any time as your org changes.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={runOnboarding}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Scanning & generating…" : "Scan org & generate plan"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-slate-50 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              What you&apos;ll get
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="rounded-xl bg-slate-800/70 px-3 py-2">
                A narrative summary of how your org is structured today.
              </li>
              <li className="rounded-xl bg-slate-800/70 px-3 py-2">
                Company-wide onboarding principles tailored to your size.
              </li>
              <li className="rounded-xl bg-slate-800/70 px-3 py-2">
                Team overviews so new hires know who does what.
              </li>
              <li className="rounded-xl bg-slate-800/70 px-3 py-2">
                Role-specific 30 / 60 / 90-day playbooks for key jobs.
              </li>
              <li className="rounded-xl bg-slate-800/70 px-3 py-2">
                A short list of risks & actions for HR and managers.
              </li>
            </ul>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            Generating your onboarding playbook…
          </p>
          <p className="mt-1 text-xs text-slate-500">
            We&apos;re analyzing your employees, teams, and roles to draft a
            30 / 60 / 90-day plan that fits how your org actually works.
          </p>
          <div className="mt-5 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
          <div className="space-y-4">
            {/* Org summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Org summary
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                High-level narrative you can paste into handbooks, onboarding
                docs, or HR updates.
              </p>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
                {result?.orgSummary ??
                  "No summary available yet. Try running the onboarding assistant again."}
              </p>
            </div>

            {/* Role playbooks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                30 / 60 / 90-day role playbooks
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                For each key role, share this with the new hire and their
                manager as a starting point.
              </p>
              <div className="mt-3 space-y-3">
                {result?.rolePlaybooks?.length ? (
                  result.rolePlaybooks.map((rp, idx) => (
                    <div
                      key={`${rp.role}-${idx}`}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                    >
                      <p className="font-semibold text-slate-900">
                        {rp.role}
                      </p>
                      <div className="mt-2 grid gap-3 md:grid-cols-3">
                        <PlaybookColumn
                          label="First 30 days"
                          items={rp.first30Days}
                        />
                        <PlaybookColumn
                          label="Days 30–60"
                          items={rp.days30to60}
                        />
                        <PlaybookColumn
                          label="Days 60–90"
                          items={rp.days60to90}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">
                    No role playbooks generated yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Principles */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Onboarding principles
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Use these as the &quot;rules of the road&quot; for every new
                hire, regardless of role.
              </p>
              <BulletedList items={result?.onboardingPrinciples ?? []} />
            </div>

            {/* Teams */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Team overviews
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                A quick way to explain how each team fits into the broader
                company story.
              </p>
              <div className="mt-3 space-y-3">
                {result?.teamOverviews?.length ? (
                  result.teamOverviews.map((t, idx) => (
                    <div
                      key={`${t.name}-${idx}`}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                    >
                      <p className="font-semibold text-slate-900">
                        {t.name}
                      </p>
                      <p className="mt-1 text-slate-700">{t.summary}</p>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        <SubList
                          label="Strengths"
                          items={t.strengths}
                        />
                        <SubList
                          label="Focus areas"
                          items={t.focusAreas}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">
                    No team overviews generated yet.
                  </p>
                )}
              </div>
            </div>

            {/* Risks & actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Risks & actions
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Where onboarding might break, and what HR / managers can do
                about it.
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs">
                  <p className="font-semibold text-rose-800">Risk areas</p>
                  <BulletedList
                    items={result?.riskAreas ?? []}
                    emptyLabel="No major risks identified."
                  />
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs">
                  <p className="font-semibold text-emerald-800">
                    Suggested actions
                  </p>
                  <BulletedList
                    items={result?.suggestedActions ?? []}
                    emptyLabel="No suggested actions yet."
                  />
                </div>
              </div>

              {error && (
                <p className="mt-3 text-[11px] text-rose-600">
                  The AI call had an issue: {error}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  disabled={loading}
                >
                  Run again
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                  disabled={!result}
                  onClick={() => {
                    // Future: POST this into /events or export as doc
                    alert(
                      "In a real deployment, this button would save the plan into Intime events or export to Notion / Google Docs."
                    );
                  }}
                >
                  Save playbook (coming soon)
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StepPill({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : done
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          done ? "bg-emerald-500" : active ? "bg-slate-100" : "bg-slate-300"
        }`}
      />
      {label}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <dt className="text-[11px] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function BulletedList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel?: string;
}) {
  if (!items?.length) {
    return (
      <p className="text-xs text-slate-400">
        {emptyLabel ?? "Nothing to show yet."}
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-1.5 text-xs text-slate-800">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2">
          <span className="mt-[6px] h-1 w-1 rounded-full bg-slate-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PlaybookColumn({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-700">{label}</p>
      <ul className="mt-1 space-y-1.5 text-[11px] text-slate-700">
        {items?.length ? (
          items.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="mt-[5px] h-1 w-1 rounded-full bg-slate-400" />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-slate-400">No items yet.</li>
        )}
      </ul>
    </div>
  );
}

function SubList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-700">{label}</p>
      <ul className="mt-1 space-y-1.5 text-[11px] text-slate-700">
        {items?.length ? (
          items.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="mt-[5px] h-1 w-1 rounded-full bg-slate-400" />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-slate-400">None listed.</li>
        )}
      </ul>
    </div>
  );
}
