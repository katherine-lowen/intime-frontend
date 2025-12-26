"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import { AccessDenied } from "@/components/support/AccessDenied";

type JobsHealth = {
  queued?: number;
  failed?: number;
  lastRunAt?: string;
};

export default function OpsClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const role = (activeOrg?.role || "").toUpperCase();
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const [health, setHealth] = useState<JobsHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<JobsHealth>(`/orgs/${orgSlug}/ops/health`);
        if (!cancelled) setHealth(res ?? null);
      } catch (err: any) {
        if (cancelled) return;
        if (err?.status === 403) {
          setError("403");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
          return;
        }
        setError(err?.message || "Unable to load ops health");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  if (!isAdmin) {
    return <AccessDenied orgSlug={orgSlug} />;
  }

  if (error === "403") {
    return <AccessDenied orgSlug={orgSlug} message="Admin access required." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Ops</p>
        <h1 className="text-2xl font-semibold text-slate-900">Operations</h1>
        <p className="text-sm text-slate-600">Monitor jobs and webhook failures.</p>
      </div>

      {error && error !== "403" ? (
        <SupportErrorCard title="Ops" message={error} requestId={requestId} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Queued jobs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {health?.queued ?? "—"}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Failed jobs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {health?.failed ?? "—"}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Last run</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            {health?.lastRunAt || "—"}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>Review and retry failed webhook deliveries.</p>
          <Link href={`/org/${orgSlug}/ops/webhooks`} className="text-indigo-600">
            View failures
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
