"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { listAuditLogs, type AuditLog } from "@/lib/api-audit";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (Number.isNaN(diff)) return "";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AuditLogPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const slug = orgSlug || "demo-org";
  const router = useRouter();
  const { role, isAdmin, isOwner, loading: orgLoading } = useCurrentOrg();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const canView = (isOwner || isAdmin) && role;

  useEffect(() => {
    if (!orgSlug || !canView) return;
    const currentSlug = orgSlug;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await listAuditLogs(currentSlug, { limit: 50 });
        if (!cancelled) {
          setLogs(data);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load audit log");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, canView]);

  const entityTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.entityType) set.add(log.entityType);
    });
    return Array.from(set);
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;
      const q = search.toLowerCase();
      const matchesQuery =
        !q ||
        log.action?.toLowerCase().includes(q) ||
        (log.entityType || "").toLowerCase().includes(q) ||
        (log.actorName || "").toLowerCase().includes(q) ||
        (log.actorEmail || "").toLowerCase().includes(q);
      return matchesEntity && matchesQuery;
    });
  }, [logs, entityFilter, search]);

  if (orgLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading organization…
        </div>
      </main>
    );
  }

  if (!canView) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">You don&apos;t have access</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Only workspace owners and admins can view audit logs.
            <div className="mt-3">
              <Button variant="outline" onClick={() => router.push(`/org/${slug}/settings`)}>
                Back to settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">Audit log</h1>
        <p className="text-sm text-slate-600">
          Track recent activity across your workspace for compliance and troubleshooting.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">Recent events</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search actions, entities, or actors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="py-6 text-sm text-slate-500">Loading audit log…</div>
          ) : error ? (
            <SupportErrorCard
              title="Unable to load audit log"
              message={error}
              requestId={(logs as any)?._requestId || null}
            />
          ) : filtered.length === 0 ? (
            <div className="py-6 text-sm text-slate-500">No events found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Actor</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => {
                  const timeLabel = formatRelative(log.createdAt);
                  const entity = [log.entityType, log.entityId?.slice(0, 8)].filter(Boolean).join(" · ");
                  const actor = log.actorName || log.actorEmail || "System";
                  return (
                    <tr key={log.id || log.createdAt + log.action}>
                      <td className="py-2 text-slate-600" title={log.createdAt}>
                        {timeLabel}
                      </td>
                      <td className="py-2 text-slate-800">
                        <div className="flex flex-col">
                          <span>{actor}</span>
                          {log.actorEmail ? (
                            <span className="text-xs text-slate-500">{log.actorEmail}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2 text-slate-800">{log.action}</td>
                      <td className="py-2 text-slate-800">{entity || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
