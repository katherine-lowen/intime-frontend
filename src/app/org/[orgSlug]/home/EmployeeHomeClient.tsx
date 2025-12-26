"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Trophy, GraduationCap, Clock, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import { getEmployeeHome } from "@/lib/employee-api";
import api from "@/lib/api";

type Task = { id: string; title?: string; dueDate?: string | null; priority?: string | null; actionUrl?: string | null };
type LearningItem = { id?: string; title?: string; dueDate?: string | null; progressPercent?: number | null; actionUrl?: string | null };
type Certificate = { id?: string; title?: string; issuedAt?: string | null; viewUrl?: string | null };
type Performance = { activeCycle?: string | null; status?: string | null; href?: string | null };
type TimeOff = { id?: string; startDate?: string | null; endDate?: string | null; status?: string | null };

export default function EmployeeHomeClient({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const { user } = useAuth() as any;
  const name = user?.firstName || user?.name || "there";

  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [onboardingPercent, setOnboardingPercent] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await getEmployeeHome(orgSlug);
        if (!cancelled) setData(res || {});
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load home");
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

  useEffect(() => {
    let cancelled = false;
    async function loadOnboarding() {
      try {
        const res: any = await api.get(`/orgs/${orgSlug}/onboarding`);
        if (cancelled) return;
        const steps = Array.isArray(res?.steps) ? res.steps : [];
        if (steps.length) {
          const completed = steps.filter((s: any) => s?.completed).length;
          const percent = Math.round((completed / steps.length) * 100);
          setOnboardingPercent(percent);
        } else if (typeof res?.progressPercent === "number") {
          setOnboardingPercent(res.progressPercent);
        } else {
          setOnboardingPercent(null);
        }
      } catch {
        if (!cancelled) setOnboardingPercent(null);
      }
    }
    void loadOnboarding();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  useEffect(() => {
    if (onboardingPercent != null && onboardingPercent < 100) {
      router.replace(`/org/${orgSlug}/getting-started`);
    }
  }, [onboardingPercent, orgSlug, router]);

  const tasks: Task[] = useMemo(() => (Array.isArray(data.tasks) ? data.tasks.slice(0, 5) : []), [data.tasks]);
  const learning: LearningItem[] = useMemo(
    () => (Array.isArray(data.learningDueSoon) ? data.learningDueSoon : []),
    [data.learningDueSoon]
  );
  const certificates: Certificate[] = useMemo(
    () => (Array.isArray(data.certificates) ? data.certificates.slice(0, 3) : []),
    [data.certificates]
  );
  const performance: Performance = data.performance || {};
  const timeOff: TimeOff[] = Array.isArray(data.timeOffUpcoming) ? data.timeOffUpcoming : [];
  const overdueCount = data.overdueLearningCount || 0;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Home</p>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {name}</h1>
          <p className="text-sm text-slate-600">Here’s what’s coming up.</p>
        </div>
        <Home className="h-6 w-6 text-slate-400" />
      </div>

      {error ? <SupportErrorCard title="Home" message={error} requestId={requestId} /> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">My tasks</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/org/${orgSlug}/tasks`}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-600">Loading tasks…</p>
            ) : tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
                No tasks right now.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <PriorityDot priority={task.priority} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{task.title || "Task"}</p>
                        <p className="text-xs text-slate-600">{task.dueDate ? `Due ${task.dueDate}` : "No due date"}</p>
                      </div>
                    </div>
                    {task.actionUrl ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (task.actionUrl?.startsWith("http")) {
                            window.location.href = task.actionUrl;
                          } else if (task.actionUrl) {
                            router.push(task.actionUrl);
                          }
                        }}
                      >
                        Open
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Learning due soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueCount > 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {overdueCount} overdue learning item{overdueCount === 1 ? "" : "s"}.
              </div>
            ) : null}
            {loading ? (
              <p className="text-sm text-slate-600">Loading…</p>
            ) : learning.length === 0 ? (
              <p className="text-sm text-slate-600">No learning due soon.</p>
            ) : (
              learning.map((item) => (
                <div key={item.id || item.title} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title || "Course"}</p>
                      <p className="text-xs text-slate-600">{item.dueDate ? `Due ${item.dueDate}` : "No due date"}</p>
                    </div>
                    {item.actionUrl ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (item.actionUrl?.startsWith("http")) {
                            window.location.href = item.actionUrl;
                          } else if (item.actionUrl) {
                            router.push(item.actionUrl);
                          }
                        }}
                      >
                        Continue
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-2">
                    <Progress value={item.progressPercent ?? 0} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-600">Loading…</p>
            ) : certificates.length === 0 ? (
              <p className="text-sm text-slate-600">No certificates yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {certificates.map((c) => (
                  <div key={c.id || c.title} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{c.title || "Certificate"}</p>
                    <p className="text-xs text-slate-600">Issued {c.issuedAt || "—"}</p>
                    {c.viewUrl ? (
                      <a
                        href={c.viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        View certificate
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-slate-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-slate-600">Loading…</p>
            ) : performance?.activeCycle ? (
              <>
                <p className="text-sm font-semibold text-slate-900">{performance.activeCycle}</p>
                <p className="text-xs text-slate-600">Status: {performance.status || "—"}</p>
                {performance.href ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (performance.href?.startsWith("http")) {
                        window.location.href = performance.href;
                      } else if (performance.href) {
                        router.push(performance.href);
                      }
                    }}
                  >
                    Open cycle
                  </Button>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-slate-600">No active performance cycle.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" /> Time off
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href={`/org/${orgSlug}/time-off/request`}>Request time off</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading…</p>
          ) : timeOff.length === 0 ? (
            <p className="text-sm text-slate-600">No upcoming time off.</p>
          ) : (
            <div className="space-y-2">
              {timeOff.map((t) => (
                <div key={t.id || `${t.startDate}-${t.endDate}`} className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {t.startDate || "Start"} → {t.endDate || "End"}
                  </p>
                  <p className="text-xs text-slate-600">Status: {t.status || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PriorityDot({ priority }: { priority?: string | null }) {
  const color =
    priority === "HIGH" ? "bg-rose-500" : priority === "MEDIUM" ? "bg-amber-500" : "bg-slate-300";
  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}
