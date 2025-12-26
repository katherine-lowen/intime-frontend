"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DecisionStatusPill } from "@/components/intelligence/DecisionStatusPill";
import { DecisionFilters } from "@/components/intelligence/DecisionFilters";
import { DecisionCreateButton } from "@/components/intelligence/DecisionCreateButton";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { createDecision, listDecisions, type Decision } from "@/lib/decisions-api";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

export default function DecisionsListClient({ orgSlug }: { orgSlug: string }) {
  const { role } = useCurrentOrg();
  const canCreate = role === "OWNER" || role === "ADMIN" || role === "MANAGER";
  const [items, setItems] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [params, setParams] = useState<{ status?: string; category?: string; q?: string }>({});
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listDecisions(orgSlug, { ...params, cursor: cursor || undefined });
        if (cancelled) return;
        const data = Array.isArray(res) ? res : res?.data || [];
        setItems(data as Decision[]);
        setNextCursor((res as any)?.cursor || null);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load decisions");
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
  }, [orgSlug, params, cursor]);

  const applyFilters = (vals: { status?: string; category?: string; q?: string }) => {
    setParams(vals);
    setCursor(null);
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Intelligence</p>
          <h1 className="text-2xl font-semibold text-slate-900">Decisions</h1>
          <p className="text-sm text-slate-600">Review and acknowledge AI recommendations.</p>
        </div>
        {canCreate ? (
          <DecisionCreateButton
            orgSlug={orgSlug}
            onCreate={async (payload) => {
              await createDecision(orgSlug, payload);
              setCursor(null);
              setParams({ ...params });
            }}
          />
        ) : null}
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Filters</CardTitle>
          <DecisionFilters
            initialStatus={params.status}
            initialCategory={params.category}
            initialQuery={params.q}
            onChange={applyFilters}
          />
        </CardHeader>
        <CardContent>
          {error ? (
            <SupportErrorCard title="Decisions" message={error} requestId={requestId} />
          ) : loading ? (
            <p className="text-sm text-slate-600">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-600">No decisions found.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-sm font-semibold text-slate-900">
                        <Link href={`/org/${orgSlug}/intelligence/decisions/${d.id}`} className="hover:underline">
                          {d.title}
                        </Link>
                        {d.recommendationKey ? (
                          <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
                            {d.recommendationKey}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2"><DecisionStatusPill status={d.status} /></td>
                      <td className="px-3 py-2 text-xs text-slate-700">{d.category || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{d.sourceType || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{d.createdAt || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3 flex justify-between text-xs text-slate-600">
            <Button
              variant="outline"
              size="sm"
              disabled={!cursor}
              onClick={() => setCursor(null)}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!nextCursor}
              onClick={() => setCursor(nextCursor)}
            >
              Next page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
