"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import { AccessDenied } from "@/components/support/AccessDenied";

type Failure = {
  id: string;
  provider?: string;
  eventType?: string;
  createdAt?: string;
  requestId?: string;
};

export default function WebhooksClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const role = (activeOrg?.role || "").toUpperCase();
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const [rows, setRows] = useState<Failure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<any>(`/orgs/${orgSlug}/ops/webhooks`);
        if (!cancelled) setRows(Array.isArray(res) ? res : res?.failures || []);
      } catch (err: any) {
        if (cancelled) return;
        if (err?.status === 403) {
          setError("403");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
          return;
        }
        setError(err?.message || "Unable to load webhooks");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const retry = async (id: string) => {
    try {
      await api.post(`/orgs/${orgSlug}/ops/webhooks/${id}/retry`);
    } catch (err: any) {
      setError(err?.message || "Retry failed");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    }
  };

  if (!isAdmin) return <AccessDenied orgSlug={orgSlug} />;
  if (error === "403") return <AccessDenied orgSlug={orgSlug} message="Admin access required." />;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Ops</p>
        <h1 className="text-2xl font-semibold text-slate-900">Webhook failures</h1>
      </div>

      {error && error !== "403" ? (
        <SupportErrorCard title="Webhooks" message={error} requestId={requestId} />
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading failures…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
          No webhook failures.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Request ID</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-xs text-slate-700">{row.provider || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{row.eventType || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.createdAt || "—"}</td>
                  <td className="px-3 py-2 text-[11px] text-slate-500">{row.requestId || "—"}</td>
                  <td className="px-3 py-2 text-xs text-indigo-600">
                    <Button size="sm" variant="outline" onClick={() => void retry(row.id)}>
                      Retry
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
