"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import {
  getOverview,
  listAlerts,
  runAlerts,
  runSnapshot,
} from "@/lib/intelligence-api";
import { usePlanGuard } from "@/hooks/usePlanGuard";
import { listRecommendations, runRecommendations } from "@/lib/intelligence-decision-api";
import { DecisionCreateDialog } from "@/components/intelligence/DecisionCreateDialog";
import { getConfidenceSummary } from "@/lib/confidence-summary-api";
import { ConfidencePill } from "@/components/intelligence/ConfidencePill";

type Alert = {
  id: string;
  severity?: string;
  title?: string;
  owner?: string;
  status?: string;
};

export default function OverviewClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowth = plan === "GROWTH" || plan === "SCALE";
  const isScale = plan === "SCALE";
  const { handlePlanError, upgradeModal } = usePlanGuard(orgSlug);

  const [overview, setOverview] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<any[]>([]);
  const [confidenceMap, setConfidenceMap] = useState<Record<string, { confidence?: number | null; delta?: number | null }>>(
    {}
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [ov, al, recList] = await Promise.all([
          getOverview(orgSlug),
          listAlerts(orgSlug, { limit: 5 }),
          listRecommendations(orgSlug),
        ]);
        if (cancelled) return;
        setOverview(ov ?? {});
        setAlerts((Array.isArray(al) ? al : []) as Alert[]);
        setRecs(Array.isArray(recList) ? recList : []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load intelligence");
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

  useEffect(() => {
    const keys = Array.from(
      new Set(
        recs
          .map((r) => r?.recommendationKey)
          .filter(Boolean)
          .map((k: any) => String(k))
      )
    );
    if (!keys.length) {
      setConfidenceMap({});
      return;
    }
    let cancelled = false;
    async function load() {
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
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, recs]);

  const kpis = useMemo(
    () => [
      {
        label: "Headcount",
        value: overview?.kpis?.headcount ?? "—",
        delta: overview?.deltas?.headcount,
      },
      {
        label: "Payroll next run",
        value: overview?.kpis?.payrollNext ?? "—",
        delta: overview?.deltas?.payroll,
      },
      {
        label: "Open jobs",
        value: overview?.kpis?.openJobs ?? "—",
        delta: overview?.deltas?.openJobs,
      },
      {
        label: "Overdue learning",
        value: overview?.kpis?.overdueLearning ?? "—",
        delta: overview?.deltas?.overdueLearning,
      },
      {
        label: "Overdue reviews",
        value: overview?.kpis?.overdueReviews ?? "—",
        delta: overview?.deltas?.overdueReviews,
      },
    ],
    [overview]
  );

  if (!isGrowth) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold text-amber-900">Upgrade to Growth</h2>
            <p className="mt-1 text-sm text-amber-800">
              Intelligence is available on Growth and Scale. Upgrade in billing to unlock signals.
            </p>
            <Button asChild className="mt-3 bg-amber-900 text-amber-50 hover:bg-amber-800">
              <Link href={`/org/${orgSlug}/settings/billing`}>View plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Intelligence</p>
          <h1 className="text-2xl font-semibold text-slate-900">Intelligence</h1>
          <p className="text-sm text-slate-600">
            Weekly operating signals across people, hiring, learning, payroll, performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await runAlerts(orgSlug);
              } catch (err: any) {
                handlePlanError(err);
              }
            }}
          >
            Refresh signals
          </Button>
          <Button
            onClick={async () => {
              try {
                await runSnapshot(orgSlug);
              } catch (err: any) {
                handlePlanError(err);
              }
            }}
          >
            Generate snapshot
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await runRecommendations(orgSlug);
                const refreshed = await listRecommendations(orgSlug);
                setRecs(Array.isArray(refreshed) ? refreshed : []);
              } catch (err: any) {
                handlePlanError(err);
              }
            }}
          >
            Refresh recommendations
          </Button>
        </div>
      </div>

      {error ? (
        <SupportErrorCard title="Intelligence" message={error} requestId={requestId} />
      ) : null}

      {upgradeModal}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading intelligence…
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="border-slate-200">
                <CardContent className="space-y-1 pt-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{kpi.label}</p>
                  <p className="text-xl font-semibold text-slate-900">{kpi.value}</p>
                  {kpi.delta ? (
                    <p className="text-xs text-slate-500">{kpi.delta}</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="border-slate-200">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-base">Recommendations</CardTitle>
                <span className="text-xs text-slate-500">Top 5</span>
              </CardHeader>
              <CardContent className="space-y-3">
                {recs.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No recommendations yet. Refresh or wait for the next snapshot.
                  </p>
                ) : (
                  recs.slice(0, 5).map((rec, idx) => (
                    <div
                      key={idx}
                      className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            rec.severity === "HIGH"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {rec.severity || "MED"}
                        </Badge>
                        {rec.recommendationKey && confidenceMap[rec.recommendationKey] ? (
                          <ConfidencePill
                            confidence={confidenceMap[rec.recommendationKey]?.confidence ?? null}
                            delta={confidenceMap[rec.recommendationKey]?.delta ?? null}
                          />
                        ) : null}
                        <p className="text-sm font-semibold text-slate-900">
                          {rec.title || "Recommendation"}
                        </p>
                      </div>
                      <p className="text-sm text-slate-700">{rec.summary || rec.body}</p>
                      {isScale && rec.rationale ? (
                        <details className="text-xs text-slate-600">
                          <summary className="cursor-pointer text-indigo-600">Why</summary>
                          <p className="mt-1 whitespace-pre-wrap">{rec.rationale}</p>
                        </details>
                      ) : null}
                      {Array.isArray(rec.actions) && rec.actions.length ? (
                        <div className="flex flex-wrap gap-2">
                          {rec.actions.map((action: any, aIdx: number) => (
                            <Button
                              key={aIdx}
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <Link href={action.href || "#"}>{action.label || "Open"}</Link>
                            </Button>
                          ))}
                        </div>
                      ) : null}
                      {isGrowth ? (
                        <DecisionCreateDialog
                          orgSlug={orgSlug}
                          defaults={{
                            title: rec.title,
                            category: rec.category || rec.type,
                            sourceType: rec.sourceType || "RECOMMENDATION",
                            sourceId: rec.id,
                            related: rec.href,
                            recommendationKey: rec.recommendationKey,
                          }}
                        />
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">What changed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {(overview?.changes || []).length ? (
                  overview.changes.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs text-slate-500">•</span>
                      <div>
                        <p className="font-medium text-slate-900">{item.title || "Change"}</p>
                        <p className="text-sm text-slate-600">{item.body || item.delta}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No changes captured yet.</p>
                )}
              </CardContent>
            </Card>

            {isScale ? (
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">AI weekly summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  {overview?.narrative ? (
                    <p className="whitespace-pre-wrap text-slate-700">{overview.narrative}</p>
                  ) : (
                    <>
                      <p className="text-slate-600">No snapshot yet. Generate to see AI insights.</p>
                      <Button size="sm" onClick={() => void runSnapshot(orgSlug)}>
                        Generate snapshot
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">AI weekly summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  Available on Scale. Upgrade to see AI narrative.
                </CardContent>
              </Card>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Alerts</CardTitle>
                <Link
                  href={`/org/${orgSlug}/intelligence/alerts`}
                  className="text-xs text-indigo-600"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-slate-600">No alerts yet.</p>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            alert.severity === "HIGH"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {alert.severity || "MED"}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {alert.title || "Alert"}
                          </p>
                          <p className="text-xs text-slate-500">{alert.owner || "Unassigned"}</p>
                        </div>
                      </div>
                      <Link
                        href={`/org/${orgSlug}/intelligence/alerts`}
                        className="text-xs text-indigo-600"
                      >
                        View
                      </Link>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Drilldowns</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Workforce", href: `/org/${orgSlug}/intelligence/workforce` },
                  { label: "Spend", href: `/org/${orgSlug}/intelligence/spend` },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 hover:border-indigo-200 hover:text-indigo-600"
                  >
                    {item.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </main>
  );
}
