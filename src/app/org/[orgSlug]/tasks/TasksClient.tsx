"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import { completeTask, dismissTask, listTasks } from "@/lib/task-api";
import { DecisionCreateDialog } from "@/components/intelligence/DecisionCreateDialog";

type Task = {
  id: string;
  title?: string;
  status?: string;
  dueDate?: string | null;
  priority?: string | null;
  source?: string | null;
  actionUrl?: string | null;
  impact?: number | null;
  riskDomain?: string | null;
  impactReason?: string | null;
  escalated?: boolean;
};

export default function TasksClient({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const { activeOrg } = useAuth();
  const role = (activeOrg?.role || "").toUpperCase();
  const [status, setStatus] = useState<"OPEN" | "COMPLETED">("OPEN");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [filterDomain, setFilterDomain] = useState<string | null>(null);
  const [filterDueSoon, setFilterDueSoon] = useState(false);
  const [filterEscalated, setFilterEscalated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listTasks(orgSlug, { status });
        if (!cancelled) setTasks(Array.isArray(res) ? res : []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load tasks");
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
  }, [orgSlug, status]);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => (t.status || "").toUpperCase() === status)
      .filter((t) => (filterDomain ? t.riskDomain === filterDomain : true))
      .filter((t) =>
        filterEscalated ? Boolean((t as any).escalated || (t as any).isEscalated) : true
      )
      .filter((t) => {
        if (!filterDueSoon || !t.dueDate) return true;
        return true; // keep for now; due soon not computed without dates
      })
      .sort((a, b) => (b.impact ?? 0) - (a.impact ?? 0));
  }, [tasks, status, filterDomain, filterEscalated, filterDueSoon]);

  const openCount = useMemo(() => filtered.length, [filtered]);

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(orgSlug, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      window.dispatchEvent(new Event("tasks:updated"));
      alert("Task completed");
    } catch (err: any) {
      alert(err?.message || "Unable to complete");
    }
  };

  const handleDismiss = async (taskId: string) => {
    try {
      await dismissTask(orgSlug, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      window.dispatchEvent(new Event("tasks:updated"));
    } catch (err: any) {
      alert(err?.message || "Unable to dismiss");
    }
  };

  const riskDomains = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.riskDomain) set.add(t.riskDomain);
    });
    return Array.from(set);
  }, [tasks]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Inbox</p>
          <h1 className="text-2xl font-semibold text-slate-900">Your Tasks</h1>
          <p className="text-sm text-slate-600">Everything you need to unblock, across Intime.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {role || "USER"}
        </span>
      </div>

      <div className="flex gap-2">
        {["OPEN", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              status === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
            onClick={() => setStatus(tab as "OPEN" | "COMPLETED")}
          >
            {tab === "OPEN" ? "Open" : "Completed"} {tab === "OPEN" && openCount ? `(${openCount})` : ""}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={filterDueSoon ? "default" : "outline"}
          onClick={() => setFilterDueSoon((p) => !p)}
        >
          Due soon
        </Button>
        <Button
          size="sm"
          variant={filterEscalated ? "default" : "outline"}
          onClick={() => setFilterEscalated((p) => !p)}
        >
          Escalated
        </Button>
        {riskDomains.map((d) => (
          <Button
            key={d}
            size="sm"
            variant={filterDomain === d ? "default" : "outline"}
            onClick={() => setFilterDomain((prev) => (prev === d ? null : d))}
          >
            {d}
          </Button>
        ))}
        {filterDomain || filterEscalated || filterDueSoon ? (
          <Button size="sm" variant="ghost" onClick={() => {
            setFilterDomain(null);
            setFilterEscalated(false);
            setFilterDueSoon(false);
          }}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {error ? <SupportErrorCard title="Tasks" message={error} requestId={requestId} /> : null}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading tasks…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-center text-sm text-slate-700">
              {status === "OPEN" ? "You’re all caught up 🎉" : "Nothing completed yet"}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                  onClick={() => setSelected(task)}
                >
                  <div className="flex items-center gap-3">
                    <PriorityDot priority={task.priority} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{task.title || "Task"}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <ImpactPill impact={task.impact} />
                        {task.riskDomain ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            {task.riskDomain}
                          </span>
                        ) : null}
                        {task.dueDate ? <span>Due {task.dueDate}</span> : null}
                        {task.source ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            {task.source}
                          </span>
                        ) : null}
                      </div>
                      {task.impactReason ? (
                        <p className="text-xs text-slate-500">Why this matters: {task.impactReason}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {task.actionUrl ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (task.actionUrl?.startsWith("http")) {
                            window.location.href = task.actionUrl;
                          } else {
                            router.push(task.actionUrl || `/org/${orgSlug}/dashboard`);
                          }
                        }}
                      >
                        Open
                      </Button>
                    ) : null}
                    {status === "OPEN" ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => void handleComplete(task.id)}>
                          Mark complete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void handleDismiss(task.id)}>
                          Dismiss
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selected ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Task</p>
              <h2 className="text-lg font-semibold text-slate-900">{selected.title || "Task"}</h2>
              <p className="text-xs text-slate-500">Impact: {selected.impact ?? "—"} {selected.impactReason ? `· ${selected.impactReason}` : ""}</p>
            </div>
            <button className="text-slate-500 hover:text-slate-700 text-sm" onClick={() => setSelected(null)}>
              ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            {selected.riskDomain ? <span className="rounded-full bg-slate-100 px-2 py-1">{selected.riskDomain}</span> : null}
            {selected.dueDate ? <span>Due {selected.dueDate}</span> : null}
            {selected.source ? <span>Source: {selected.source}</span> : null}
          </div>
          {selected.actionUrl ? (
            <div className="mt-3">
              <Button size="sm" onClick={() => selected.actionUrl?.startsWith("http") ? (window.location.href = selected.actionUrl!) : router.push(selected.actionUrl!)}>
                Open
              </Button>
            </div>
          ) : null}
          {selected.impact != null && selected.impact >= 80 ? (
            <div className="mt-4">
              <DecisionCreateDialog
                orgSlug={orgSlug}
                defaults={{
                  title: selected.title,
                  category: selected.riskDomain || selected.source || undefined,
                  sourceType: "TASK",
                  sourceId: selected.id,
                  related: selected.actionUrl || undefined,
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PriorityDot({ priority }: { priority?: string | null }) {
  const color =
    priority === "HIGH" ? "bg-rose-500" : priority === "MEDIUM" ? "bg-amber-500" : "bg-slate-300";
  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}

function ImpactPill({ impact }: { impact?: number | null }) {
  if (impact == null) {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">Impact —</span>;
  }
  const shade = impact >= 80 ? "bg-rose-100 text-rose-800" : impact >= 50 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${shade}`}>
      Impact {impact}
    </span>
  );
}
