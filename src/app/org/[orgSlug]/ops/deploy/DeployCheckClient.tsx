"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { AccessDenied } from "@/components/support/AccessDenied";
import { useAuth } from "@/context/auth";
import { getHealth, getSanity } from "@/lib/deploy-api";

type Check = {
  status?: string;
  details?: any;
  requestId?: string | null;
};

export default function DeployCheckClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const role = (activeOrg?.role || "").toUpperCase();
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const [health, setHealth] = useState<Check | null>(null);
  const [sanity, setSanity] = useState<Check | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const [h, s] = await Promise.all([getHealth(orgSlug), getSanity(orgSlug)]);
      setHealth(h ?? null);
      setSanity(s ?? null);
    } catch (err: any) {
      setError(err?.message || "Unable to load deploy checks");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSlug]);

  if (!isAdmin) return <AccessDenied orgSlug={orgSlug} />;

  const checklist = [
    { label: "DB connected", ok: sanity?.details?.dbConnected },
    { label: "Env ok", ok: sanity?.details?.envOk },
    { label: "Email configured", ok: sanity?.details?.emailConfigured },
    { label: "Billing configured", ok: sanity?.details?.billingConfigured },
    { label: "Webhooks configured", ok: sanity?.details?.webhooksConfigured },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Ops</p>
          <h1 className="text-2xl font-semibold text-slate-900">Deploy check</h1>
          <p className="text-sm text-slate-600">Verify backend health and setup.</p>
        </div>
        <Button onClick={() => void load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {error ? (
        <SupportErrorCard title="Deploy check" message={error} requestId={requestId} />
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading checks…
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Backend health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div>Status: {health?.status || "unknown"}</div>
              {health?.requestId ? (
                <div className="text-xs text-slate-500">Request ID: {health.requestId}</div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Sanity check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div>Status: {sanity?.status || "unknown"}</div>
              {sanity?.requestId ? (
                <div className="text-xs text-slate-500">Request ID: {sanity.requestId}</div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span>{item.label}</span>
              <span className={item.ok ? "text-emerald-600" : "text-amber-700"}>
                {item.ok ? "OK" : "Missing"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
