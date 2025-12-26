"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import { getOverview } from "@/lib/intelligence-api";

export default function SpendClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowth = plan === "GROWTH" || plan === "SCALE";
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getOverview(orgSlug);
        if (!cancelled) setData(res || {});
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load spend insights");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (isGrowth) void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, isGrowth]);

  if (!isGrowth) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold text-amber-900">Upgrade to Growth</h2>
            <p className="mt-1 text-sm text-amber-800">
              Spend intelligence is available on Growth and Scale.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Intelligence</p>
        <h1 className="text-2xl font-semibold text-slate-900">Spend</h1>
      </div>

      {error ? <SupportErrorCard title="Spend" message={error} requestId={requestId} /> : null}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading spend insights…
        </div>
      ) : (
        <>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Payroll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Last run gross</span>
                <span>{data?.spend?.lastGross ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Next payroll projected</span>
                <span>{data?.spend?.nextProjected ?? "—"}</span>
              </div>
              {data?.spend?.nextDelta ? (
                <div className="text-xs text-slate-500">{data.spend.nextDelta}</div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              {Array.isArray(data?.spend?.forecast) && data.spend.forecast.length > 0 ? (
                data.spend.forecast.map((row: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-2">
                    <span>{row.date || "Upcoming"}</span>
                    <span>{row.amount || "—"}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">Connect payroll to see forecast.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Approved comp changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              {Array.isArray(data?.spend?.changes) && data.spend.changes.length > 0 ? (
                data.spend.changes.map((row: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-2">
                    <span>{row.employee || "Employee"}</span>
                    <span>{row.effective || "Soon"}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">
                  No upcoming comp changes. Approve changes to see them here.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
