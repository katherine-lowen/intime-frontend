"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { DelegationModal } from "@/components/ai/DelegationModal";
import { toggleDelegation, createDelegation, updateDelegation, listDelegations, runDelegation, type Delegation } from "@/lib/delegations-api";
import { getConfidenceSummary } from "@/lib/confidence-summary-api";
import { ConfidencePill } from "@/components/intelligence/ConfidencePill";

type RunResult = { tasks?: { id: string; title?: string }[]; status?: string; ranAt?: string };

export default function DelegationsClient({ orgSlug }: { orgSlug: string }) {
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Delegation | null>(null);
  const [runInfo, setRunInfo] = useState<RunResult | null>(null);
  const [confidenceMap, setConfidenceMap] = useState<Record<string, { confidence?: number | null; delta?: number | null }>>(
    {}
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const res = await listDelegations(orgSlug);
      const data = Array.isArray(res) ? res : res?.data || [];
      setDelegations(data as Delegation[]);
    } catch (err: any) {
      setError(err?.message || "Unable to load delegations");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [orgSlug]);

  useEffect(() => {
    const keys = Array.from(
      new Set(
        delegations
          .map((d: any) => d?.recommendationKey || (d as any)?.confidenceKey)
          .filter(Boolean)
          .map((k: any) => String(k))
      )
    );
    if (!keys.length) {
      setConfidenceMap({});
      return;
    }
    let cancelled = false;
    async function loadConfidence() {
      try {
        const entries = await Promise.all(
          keys.map(async (key) => {
            try {
              const res = await getConfidenceSummary(orgSlug, key);
              return [key, res] as const;
            } catch {
              return [key, null] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<string, { confidence?: number | null; delta?: number | null }> = {};
          entries.forEach(([k, v]) => {
            if (v) map[k] = v;
          });
          setConfidenceMap(map);
        }
      } catch {
        if (!cancelled) setConfidenceMap({});
      }
    }
    void loadConfidence();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, delegations]);

  const save = async (payload: Partial<Delegation>) => {
    if (payload.id) {
      await updateDelegation(orgSlug, payload.id, payload);
    } else {
      await createDelegation(orgSlug, payload);
    }
    await load();
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">AI</p>
          <h1 className="text-2xl font-semibold text-slate-900">Delegations</h1>
          <p className="text-sm text-slate-600">Automate recurring AI tasks with policy + cadence.</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>New delegation</Button>
      </div>

      {error ? <SupportErrorCard title="Delegations" message={error} requestId={requestId} /> : null}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Configured delegations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading…</p>
          ) : delegations.length === 0 ? (
            <p className="text-sm text-slate-600">No delegations yet.</p>
          ) : (
            <div className="space-y-3">
              {delegations.map((d) => (
                <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                    <p className="text-xs text-slate-600">
                      Cadence: {d.cadence || "—"} · Scope: {d.scope || "—"}
                    </p>
                    {((d as any)?.recommendationKey || (d as any)?.confidenceKey) &&
                    confidenceMap[(d as any)?.recommendationKey || (d as any)?.confidenceKey] ? (
                      <div className="mt-1">
                        <span className="text-[11px] text-slate-500">Reliability</span>{" "}
                        <ConfidencePill
                          confidence={
                            confidenceMap[(d as any)?.recommendationKey || (d as any)?.confidenceKey]?.confidence ?? null
                          }
                          delta={confidenceMap[(d as any)?.recommendationKey || (d as any)?.confidenceKey]?.delta ?? null}
                        />
                      </div>
                    ) : null}
                  </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(d);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await toggleDelegation(orgSlug, d.id, !(d.enabled ?? true));
                          await load();
                        }}
                      >
                        {d.enabled === false ? "Enable" : "Disable"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const res = await runDelegation(orgSlug, d.id);
                          setRunInfo({
                            status: (res as any)?.status,
                            ranAt: (res as any)?.ranAt,
                            tasks: (res as any)?.tasks,
                          });
                          await load();
                        }}
                      >
                        Run now
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      {d.enabled === false ? "Disabled" : "Enabled"}
                    </span>
                    {d.lastRunStatus ? <span>Last: {d.lastRunStatus}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {runInfo ? (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Last run</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div>Status: {runInfo.status || "—"}</div>
            <div>Ran at: {runInfo.ranAt || "—"}</div>
            {Array.isArray(runInfo.tasks) && runInfo.tasks.length ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Tasks created</p>
                <ul className="list-disc pl-4">
                  {runInfo.tasks.map((t) => (
                    <li key={t.id}>
                      <a className="text-indigo-600 hover:underline" href={`/org/${orgSlug}/tasks`}>
                        {t.title || "Task"} ({t.id})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <DelegationModal
        orgSlug={orgSlug}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={
          editing
            ? {
                id: editing.id,
                title: editing.title,
                scope: editing.scope || undefined,
                cadence: editing.cadence || undefined,
                policy: editing.policy || undefined,
              }
            : undefined
        }
        onSave={save}
      />
    </div>
  );
}
