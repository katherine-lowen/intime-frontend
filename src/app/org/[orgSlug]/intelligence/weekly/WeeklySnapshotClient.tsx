"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowRight, AlertTriangle, CheckCircle2, Loader2, Sparkles, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { listSnapshots, runSnapshot } from "@/lib/intelligence-api";
import { listTasks } from "@/lib/task-api";
import { DecisionCreateDialog } from "@/components/intelligence/DecisionCreateDialog";
import { usePlanGuard } from "@/hooks/usePlanGuard";
import { toast } from "sonner";
import { getConfidenceSummary } from "@/lib/confidence-summary-api";
import { ConfidencePill } from "@/components/intelligence/ConfidencePill";

type Snapshot = {
  id: string;
  weekStart: string;
  highlights?: any[];
  risks?: any[];
  recommendations?: any[];
  tasks?: any[];
};

type Risk = {
  id: string;
  title?: string | null;
  summary?: string | null;
  impact?: number | null;
  actionUrl?: string | null;
  recommendationKey?: string | null;
};

type Recommendation = {
  id: string;
  title?: string | null;
  summary?: string | null;
  actionUrl?: string | null;
  recommendationKey?: string | null;
};

type Task = {
  id: string;
  title?: string | null;
  impact?: number | null;
  dueDate?: string | null;
  actionUrl?: string | null;
};

function formatWeek(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function WeeklySnapshotClient({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const { handlePlanError, upgradeModal } = usePlanGuard(orgSlug);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisionDefaults, setDecisionDefaults] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [confidenceMap, setConfidenceMap] = useState<Record<string, { confidence?: number | null; delta?: number | null }>>(
    {}
  );
  const [showDiff, setShowDiff] = useState(false);

  const weekOptions = useMemo(() => {
    const today = new Date();
    const weeks: string[] = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - d.getDay() - i * 7); // start of week
      weeks.push(d.toISOString().slice(0, 10));
    }
    const apiWeeks = snapshots.map((s) => s.weekStart).filter(Boolean);
    const merged = Array.from(new Set([...apiWeeks, ...weeks]));
    return merged.slice(0, 8);
  }, [snapshots]);

  const activeSnapshot = useMemo(() => {
    const match = snapshots.find((s) => s.weekStart === selectedWeek);
    return match ?? snapshots[0] ?? null;
  }, [snapshots, selectedWeek]);
  const previousSnapshot = useMemo(() => {
    if (!snapshots.length) return null;
    const idx = snapshots.findIndex((s) => s.weekStart === (activeSnapshot?.weekStart || ""));
    if (idx === -1) return snapshots[1] ?? null;
    return snapshots[idx + 1] ?? null;
  }, [snapshots, activeSnapshot]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listSnapshots(orgSlug);
        if (cancelled) return;
        const normalized: Snapshot[] = (res as any[]).map((s, idx) => ({
          id: s?.id ?? `snapshot-${idx}`,
          weekStart: s?.weekStart ?? s?.week ?? "",
          highlights: Array.isArray(s?.highlights) ? s.highlights : s?.data?.highlights ?? [],
          risks: Array.isArray(s?.risks) ? s.risks : s?.data?.risks ?? [],
          recommendations: Array.isArray(s?.recommendations)
            ? s.recommendations
            : s?.data?.recommendations ?? [],
          tasks: Array.isArray(s?.tasks) ? s.tasks : s?.data?.tasks ?? [],
        }));
        setSnapshots(normalized);
        const defaultWeek = normalized[0]?.weekStart || weekOptions[0] || "";
        setSelectedWeek((prev) => prev || defaultWeek);
      } catch (err: any) {
        if (cancelled) {
          return;
        }
        setError(err?.message || "Unable to load weekly snapshot");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, weekOptions, showDiff]);

  useEffect(() => {
    let cancelled = false;
    async function loadTasks() {
      try {
        const res = await listTasks(orgSlug, { status: "OPEN" });
        if (!cancelled) {
          const sorted = Array.isArray(res)
            ? [...res].sort((a: any, b: any) => (b.impact || 0) - (a.impact || 0)).slice(0, 5)
            : [];
          setTasks(sorted as Task[]);
        }
      } catch {
        if (!cancelled) setTasks([]);
      }
    }
    void loadTasks();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await runSnapshot(orgSlug);
      toast.success("Generated latest narrative");
      window.location.reload();
    } catch (err: any) {
      if (!handlePlanError(err)) toast.error(err?.message || "Unable to generate");
    } finally {
      setGenerating(false);
    }
  };

  const highlights = activeSnapshot?.highlights ?? [];
  const risks: Risk[] = (activeSnapshot?.risks as any[])?.map((r, idx) => ({
    id: r?.id ?? `risk-${idx}`,
    title: r?.title ?? r?.summary ?? "Risk",
    summary: r?.summary ?? r?.description ?? null,
    impact: r?.impact ?? r?.score ?? r?.riskScore ?? null,
    actionUrl: r?.actionUrl ?? r?.href ?? null,
    recommendationKey: r?.recommendationKey ?? null,
  })) ?? [];
  const recommendations: Recommendation[] =
    (activeSnapshot?.recommendations as any[])?.map((rec, idx) => ({
      id: rec?.id ?? `rec-${idx}`,
      title: rec?.title ?? "Recommendation",
      summary: rec?.summary ?? rec?.description ?? null,
      actionUrl: rec?.actionUrl ?? rec?.href ?? null,
      recommendationKey: rec?.recommendationKey ?? null,
    })) ?? [];
  const changeCards = useMemo(() => {
    if (!showDiff || !activeSnapshot || !previousSnapshot) return [];
    const prevRisks = Array.isArray(previousSnapshot.risks) ? previousSnapshot.risks.length : 0;
    const prevRecs = Array.isArray(previousSnapshot.recommendations) ? previousSnapshot.recommendations.length : 0;
    const prevHighlights = Array.isArray(previousSnapshot.highlights) ? previousSnapshot.highlights.length : 0;
    const prevTasks = Array.isArray(previousSnapshot.tasks) ? previousSnapshot.tasks.length : 0;

    const items = [
      { label: "Highlights", value: highlights.length, prev: prevHighlights },
      { label: "Risks", value: risks.length, prev: prevRisks },
      { label: "Recommendations", value: recommendations.length, prev: prevRecs },
      { label: "Tasks", value: tasks.length, prev: prevTasks },
    ];
    return items.map((item) => {
      const delta = item.value - item.prev;
      return { ...item, delta };
    });
  }, [showDiff, activeSnapshot, previousSnapshot, highlights.length, risks.length, recommendations.length, tasks.length]);

  useEffect(() => {
    const keys = Array.from(
      new Set(
        [...risks, ...recommendations]
          .map((r) => r.recommendationKey)
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
  }, [orgSlug, risks, recommendations]);

  return (
    <div className="space-y-5">
      {upgradeModal}
      {error ? <SupportErrorCard message={error} requestId={requestId} /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Intelligence</p>
          <h1 className="text-2xl font-semibold text-slate-900">Weekly snapshot</h1>
          <p className="text-sm text-slate-600">Executive briefing across people, hiring, learning, payroll.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            {weekOptions.map((week) => (
              <option key={week} value={week}>
                Week of {formatWeek(week)}
              </option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-sm">
            <button
              type="button"
              className={`px-3 py-2 ${!showDiff ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}
              onClick={() => setShowDiff(false)}
            >
              This week
            </button>
            <button
              type="button"
              className={`px-3 py-2 ${showDiff ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}
              onClick={() => setShowDiff(true)}
            >
              This week + Changes
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push(`/org/${orgSlug}/intelligence`)}>
            Intelligence home
          </Button>
          <Button size="sm" className="gap-2" onClick={() => void handleGenerate()} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate narrative
          </Button>
        </div>
      </div>

      {showDiff && changeCards.length ? (
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
          {changeCards.map((c) => (
            <div key={c.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xl font-semibold text-slate-900">{c.value}</span>
                <span
                  className={`text-xs font-semibold ${
                    c.delta > 0 ? "text-emerald-600" : c.delta < 0 ? "text-rose-600" : "text-slate-500"
                  }`}
                >
                  {c.delta > 0 ? "+" : ""}
                  {c.delta}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Prev {c.prev}</p>
            </div>
          ))}
        </div>
      ) : null}

      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Highlights</CardTitle>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-4 w-4" />
            Week of {formatWeek(selectedWeek || weekOptions[0] || "")}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {highlights.length === 0 ? (
            <div className="col-span-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No highlights recorded for this week.
            </div>
          ) : (
            highlights.map((item, idx) => (
              <div key={item?.id ?? idx} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item?.title ?? "Highlight"}
                </div>
                {item?.summary ? <p className="mt-2 text-sm text-slate-600">{item.summary}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Risks</CardTitle>
          <span className="text-xs text-slate-500">Ranked by impact</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {risks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No risks logged this week.
            </div>
          ) : (
            risks.map((risk) => (
              <div
                key={risk.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  {risk.title}
                </div>
                {risk.recommendationKey && confidenceMap[risk.recommendationKey] ? (
                  <ConfidencePill
                    confidence={confidenceMap[risk.recommendationKey]?.confidence ?? null}
                    delta={confidenceMap[risk.recommendationKey]?.delta ?? null}
                  />
                ) : null}
                {risk.summary ? <p className="text-sm text-slate-600">{risk.summary}</p> : null}
              </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-[11px] ${
                      risk.impact && risk.impact >= 80
                        ? "bg-rose-100 text-rose-800"
                        : risk.impact && risk.impact >= 50
                        ? "bg-amber-100 text-amber-800"
                        : ""
                    }`}
                  >
                    Impact {risk.impact ?? "—"}
                  </Badge>
                  {risk.actionUrl ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={risk.actionUrl}>Open</Link>
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() =>
                      setDecisionDefaults({
                        title: risk.title,
                        category: "RISK",
                        sourceType: "INTELLIGENCE_RISK",
                        sourceId: risk.id,
                        related: risk.actionUrl,
                        recommendationKey: risk.recommendationKey,
                      })
                    }
                  >
                    Create decision
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Recommendations</CardTitle>
          <span className="text-xs text-slate-500">Act fast to stay ahead</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No recommendations yet.
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    {rec.title}
                  </div>
                  {rec.recommendationKey && confidenceMap[rec.recommendationKey] ? (
                    <ConfidencePill
                      confidence={confidenceMap[rec.recommendationKey]?.confidence ?? null}
                      delta={confidenceMap[rec.recommendationKey]?.delta ?? null}
                    />
                  ) : null}
                  {rec.summary ? <p className="text-sm text-slate-600">{rec.summary}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {rec.actionUrl ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={rec.actionUrl}>Open</Link>
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() =>
                      setDecisionDefaults({
                        title: rec.title,
                        category: "INTELLIGENCE",
                        sourceType: "INTELLIGENCE_RECOMMENDATION",
                        sourceId: rec.id,
                        related: rec.actionUrl,
                        recommendationKey: rec.recommendationKey,
                      })
                    }
                  >
                    Create decision
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/org/${orgSlug}/tasks`)}>
                    Create task
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Top tasks this week</CardTitle>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/org/${orgSlug}/tasks`}>Open inbox</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No open tasks.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{task.title || "Task"}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {task.dueDate ? <span>Due {task.dueDate}</span> : null}
                    {task.impact != null ? (
                      <Badge
                        variant="secondary"
                        className={`text-[11px] ${
                          task.impact >= 80
                            ? "bg-rose-100 text-rose-800"
                            : task.impact >= 50
                            ? "bg-amber-100 text-amber-800"
                            : ""
                        }`}
                      >
                        Impact {task.impact}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.actionUrl ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={task.actionUrl}>Open</Link>
                    </Button>
                  ) : null}
                  <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                    <Link href={`/org/${orgSlug}/tasks`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {decisionDefaults ? (
        <DecisionCreateDialog
          hideTrigger
          open
          defaults={decisionDefaults}
          orgSlug={orgSlug}
          onOpenChange={(open) => !open && setDecisionDefaults(null)}
          onCreated={() => setDecisionDefaults(null)}
        />
      ) : null}
    </div>
  );
}
