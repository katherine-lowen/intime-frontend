"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { AiStudioShell } from "../AiStudioShell";
import {
  getInvocation,
  listActions,
  listInvocations,
  getInvocationEvidence,
} from "@/lib/ai-studio-api";

type Invocation = {
  id: string;
  actionKey?: string;
  actionName?: string;
  actor?: string;
  status?: string;
  createdAt?: string;
  inputSummary?: string;
  outputSummary?: string;
  metadata?: Record<string, any>;
  confidence?: string;
};

export default function ActivityClient({ orgSlug }: { orgSlug: string }) {
  const [invocations, setInvocations] = useState<Invocation[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [mineOnly, setMineOnly] = useState(false);
  const [selected, setSelected] = useState<Invocation | null>(null);
  const [evidence, setEvidence] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [acts, invs] = await Promise.all([
          listActions(orgSlug),
          listInvocations(orgSlug, {}),
        ]);
        if (cancelled) return;
        setActions((acts as any[]) || []);
        setInvocations((invs as Invocation[]) || []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load activity");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const filtered = useMemo(() => {
    return invocations.filter((inv) => {
      const matchesAction = filterAction ? inv.actionKey === filterAction : true;
      const matchesStatus = filterStatus ? inv.status === filterStatus : true;
      const matchesMine = mineOnly ? inv.actor === "me" : true;
      return matchesAction && matchesStatus && matchesMine;
    });
  }, [invocations, filterAction, filterStatus, mineOnly]);

  const openDetail = async (id: string) => {
    try {
      const res = await getInvocation(orgSlug, id);
      setSelected(res || null);
      const ev = await getInvocationEvidence(orgSlug, id);
      setEvidence(Array.isArray(ev) ? ev : []);
    } catch {
      // ignore
    }
  };

  return (
    <AiStudioShell orgSlug={orgSlug}>
      {error ? (
        <SupportErrorCard title="Activity" message={error} requestId={requestId} />
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a.key} value={a.key}>
              {a.name || a.key}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="SUCCEEDED">Succeeded</option>
          <option value="FAILED">Failed</option>
          <option value="RUNNING">Running</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
          />
          Mine only
        </label>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading activity…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
          No activity yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {inv.createdAt || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {inv.actionName || inv.actionKey || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{inv.actor || "—"}</td>
                  <td className="px-3 py-2">
                    <Badge
                      className={
                        inv.status === "FAILED"
                          ? "bg-rose-100 text-rose-800"
                          : inv.status === "RUNNING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                      }
                    >
                      {inv.status || "UNKNOWN"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-indigo-600">
                    <button onClick={() => void openDetail(inv.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Invocation details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <span>ID: {selected.id}</span>
              <span>Action: {selected.actionName || selected.actionKey}</span>
              <span>Status: {selected.status}</span>
              {selected.confidence ? (
                <Badge
                  className={
                    selected.confidence === "HIGH"
                      ? "bg-emerald-100 text-emerald-800"
                      : selected.confidence === "LOW"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-800"
                  }
                >
                  {selected.confidence} confidence
                </Badge>
              ) : null}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Input</p>
              <p className="text-sm text-slate-700">
                {selected.inputSummary || "Sanitized"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Output</p>
              <p className="text-sm text-slate-700">
                {selected.outputSummary || "—"}
              </p>
            </div>
            {selected.metadata ? (
              <pre className="rounded-lg bg-slate-950 p-3 text-[11px] text-slate-200">
                {JSON.stringify(selected.metadata, null, 2)}
              </pre>
            ) : null}
            {evidence.length ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Evidence</p>
                <ul className="space-y-1 text-xs text-slate-700">
                  {evidence.map((ev, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500">•</span>
                      {ev.url ? (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {ev.label || ev.url}
                        </a>
                      ) : (
                        <span>{ev.label || "Evidence"}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </AiStudioShell>
  );
}
