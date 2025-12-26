"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  PlusCircle,
} from "lucide-react";

import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import {
  listAssignments,
  listCourses,
  getMeGamification,
  getAiRecommendations,
} from "@/lib/learning-api";
import api from "@/lib/api";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";

type Course = {
  id: string;
  title?: string | null;
  level?: string | null;
  durationMinutes?: number | null;
  status?: string | null;
};

type Path = {
  id: string;
  title?: string | null;
  coursesCount?: number | null;
  status?: string | null;
};

type Assignment = {
  id: string;
  title?: string | null;
  assigneeName?: string | null;
  dueDate?: string | null;
  status?: string | null;
  courseId?: string | null;
  escalationStatus?: string | null;
};

type Props = {
  orgSlug: string;
};

type FetchResult<T> = {
  items: T[];
  missing: boolean;
  requestId?: string | null;
};

function normalizeList<T>(data: any, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  if (Array.isArray(data?.[key])) return data[key] as T[];
  return [];
}

async function fetchWithFallback<T>(
  orgSlug: string,
  primaryPath: string,
  fallbackPath: string,
  key: string
): Promise<FetchResult<T>> {
  const paths = [primaryPath, fallbackPath];

  for (let i = 0; i < paths.length; i += 1) {
    const path = paths[i];
    if (!path) continue;
    try {
      const res: any = await api.get(
        `${path}?orgSlug=${encodeURIComponent(orgSlug)}`
      );
      return {
        items: normalizeList<T>(res, key),
        missing: false,
        requestId: (res as any)?._requestId ?? null,
      };
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        continue;
      }
      throw err;
    }
  }

  return { items: [], missing: true };
}

function formatDuration(minutes?: number | null) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function statusPill(label?: string | null) {
  if (!label) return null;
  const text = label.toUpperCase();
  const base =
    text === "DRAFT"
      ? "bg-amber-50 text-amber-800 border-amber-100"
      : text === "ACTIVE"
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${base}`}
    >
      {label}
    </span>
  );
}

export default function LearningClient({ orgSlug }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [gamification, setGamification] = useState<any | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [missingEndpoints, setMissingEndpoints] = useState(false);
  const { activeOrg } = useAuth();
  const role = (activeOrg?.role || "").toUpperCase();
  const canManage =
    role === "OWNER" || role === "ADMIN" || role === "MANAGER" || role === "";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      setMissingEndpoints(false);

      try {
        const [coursesRes, pathsRes, assignmentsRes] = await Promise.all([
          fetchWithFallback<Course>(
            orgSlug,
            "/learning/courses",
            "/courses",
            "courses"
          ),
          fetchWithFallback<Path>(orgSlug, "/learning/paths", "/paths", "paths"),
          (async () => {
            try {
              const list = await listAssignments(orgSlug);
              return { items: list, missing: false, requestId: null };
            } catch (err: any) {
              if (err?.response?.status === 404) {
                return { items: [], missing: true, requestId: null };
              }
              throw err;
            }
          })(),
        ]);

        // legacy recs removed

        if (canManage && (role === "OWNER" || role === "ADMIN" || role === "MANAGER" || role === "")) {
          // noop
        }

        try {
          const rec = await getAiRecommendations(orgSlug);
          if (!cancelled) setAiRecommendations(rec || []);
        } catch {
          // ignore
        }

        try {
          const gam = await getMeGamification(orgSlug);
          if (!cancelled) setGamification(gam);
        } catch {
          // ignore
        }

        if (cancelled) return;

        setCourses(coursesRes.items || []);
        setPaths(pathsRes.items || []);
        setAssignments(assignmentsRes.items || []);

        const missing =
          coursesRes.missing || pathsRes.missing || assignmentsRes.missing;
        setMissingEndpoints(missing);

        const ids = [coursesRes.requestId, pathsRes.requestId, assignmentsRes.requestId].filter(
          Boolean
        );
        if (ids.length > 0) setRequestId(ids[0] || null);
      } catch (err: any) {
        if (cancelled) return;
        const status = err?.response?.status;
        const msg =
          err?.message ||
          (status ? `Request failed with status ${status}` : "Failed to load learning data");
        setError(msg);
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

  const overdueCount = useMemo(() => {
    if (!assignments?.length) return 0;
    const now = new Date();
    return assignments.filter((a) => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate);
      if (Number.isNaN(due.getTime())) return false;
      const status = (a.status || "").toUpperCase();
      const complete = status === "COMPLETE" || status === "COMPLETED";
      return !complete && due < now;
    }).length;
  }, [assignments]);

  const kpis = [
    { label: "Courses", value: loading ? "—" : courses.length },
    { label: "Paths", value: loading ? "—" : paths.length },
    { label: "Assignments", value: loading ? "—" : assignments.length },
    { label: "Overdue", value: loading ? "—" : overdueCount },
  ];

  const assignedToMe = assignments;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Learning
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Learning
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Onboarding, compliance, and skill development — all in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage && (
            <>
              <Button asChild className="inline-flex items-center gap-2">
                <Link href={`/org/${orgSlug}/learning/courses/new`}>
                  Create course
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="inline-flex items-center gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              >
                <Link href={`/org/${orgSlug}/learning?createPath=1`}>
                  Create path
                  <PlusCircle className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="inline-flex items-center gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              >
                <Link href={`/org/${orgSlug}/learning/courses/new?invite=1`}>
                  Invite
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="inline-flex items-center gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              >
                <Link href={`/org/${orgSlug}/learning/inbox`}>Inbox</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {kpi.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </section>

      {gamification ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Current streak</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{gamification.currentStreak ?? 0} days</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Best streak</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{gamification.bestStreak ?? 0} days</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Badges</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{(gamification.badges || []).length}</p>
          </div>
          <div className="sm:col-span-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Your achievements</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(gamification.badges || []).map((b: any, idx: number) => (
                <span
                  key={idx}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {b.name || b.title || "Badge"}
                </span>
              ))}
              {(gamification.badges || []).length === 0 ? (
                <span className="text-xs text-slate-500">No badges yet.</span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <SupportErrorCard
          title="Unable to load learning data"
          message={error}
          requestId={requestId}
        />
        ) : null}

      {missingEndpoints ? (
        <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          No learning endpoints found yet. Implement GET /learning/courses, /learning/paths, /learning/assignments.
        </div>
      ) : null}

      {aiRecommendations.length > 0 ? (
        <Card title="Recommended for you" icon={BookOpen}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aiRecommendations.map((rec: any) => (
              <Link
                key={rec.course?.id || rec.id}
                href={showScaleModal ? "#" : `/org/${orgSlug}/learning/courses/${rec.course?.id || rec.id}`}
                onClick={(e) => {
                  if (showScaleModal) e.preventDefault();
                }}
                className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {rec.course?.title || rec.title || "Course"}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Because: {rec.reason || "We think you’ll find this useful."}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
          {showScaleModal ? "Upgrade to Scale for AI recommendations." : "No recommendations yet."}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {gamification ? (
            <Card title="Recent achievements" icon={ClipboardList}>
              {gamification.badges?.length ? (
                <div className="flex flex-wrap gap-2">
                  {gamification.badges.slice(0, 6).map((b: any, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {b.name || b.title || "Badge"}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No achievements yet.</p>
              )}
            </Card>
          ) : null}
          <Card title="Assigned to you" icon={ClipboardList}>
            {assignedToMe.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {assignedToMe.map((assignment) => {
                  const dueDateValid = assignment.dueDate && !Number.isNaN(Date.parse(assignment.dueDate));
                  const due = dueDateValid ? format(new Date(assignment.dueDate!), "MMM d, yyyy") : "—";
                  const daysDiff =
                    dueDateValid && ((new Date(assignment.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const overdue = typeof daysDiff === "number" && daysDiff < 0;
                  const dueLabel =
                    typeof daysDiff === "number"
                      ? overdue
                        ? `Overdue by ${Math.abs(Math.round(daysDiff))}d`
                        : `Due in ${Math.round(daysDiff)}d`
                      : null;
                  return (
                    <div key={assignment.id} className="flex items-center justify-between gap-3 px-2 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {assignment.title || "Assignment"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Due: {due} {dueLabel ? `· ${dueLabel}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.escalationStatus ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {assignment.escalationStatus}
                          </span>
                        ) : null}
                        {overdue ? (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                            Overdue
                          </span>
                        ) : null}
                        {statusPill(assignment.status)}
                        <Button
                          asChild
                          size="sm"
                          className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                          <Link
                            href={`/org/${orgSlug}/learning/courses/${assignment.courseId || assignment.id}/learn`}
                          >
                            Start
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No assignments yet"
                body="You don’t have any assigned courses."
                ctaLabel="Browse courses"
                href={`/org/${orgSlug}/learning`}
              />
            )}
          </Card>

          <Card title="Courses" icon={BookOpen}>
            {courses.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/org/${orgSlug}/learning/courses/${course.id}`}
                    className="flex items-center justify-between gap-3 px-2 py-3 hover:bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {course.title || "Untitled course"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Level: {course.level || "—"} · Duration:{" "}
                        {formatDuration(course.durationMinutes)}
                      </p>
                    </div>
                    {statusPill(course.status)}
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No courses yet"
                body="Create courses to onboard and upskill your team."
                ctaLabel="Create course"
                href={`/org/${orgSlug}/learning?createCourse=1`}
              />
            )}
          </Card>

          <Card title="Learning paths" icon={GraduationCap}>
            {paths.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {paths.map((path) => (
                  <Link
                    key={path.id}
                    href={`/org/${orgSlug}/learning/paths/${path.id}`}
                    className="flex items-center justify-between gap-3 px-2 py-3 hover:bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {path.title || "Untitled path"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Courses: {path.coursesCount ?? "—"}
                      </p>
                    </div>
                    {statusPill(path.status)}
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={GraduationCap}
                title="No paths yet"
                body="Group courses into paths for roles or teams."
                ctaLabel="Create path"
                href={`/org/${orgSlug}/learning?createPath=1`}
              />
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Assignments" icon={ClipboardList}>
            {assignments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {assignments.map((assignment) => {
                  const status = (assignment.status || "").toUpperCase();
                  const due =
                    assignment.dueDate && !Number.isNaN(Date.parse(assignment.dueDate))
                      ? format(new Date(assignment.dueDate), "MMM d, yyyy")
                      : "—";
                  const isComplete = status === "COMPLETE" || status === "COMPLETED";
                  const isOverdue =
                    !isComplete &&
                    assignment.dueDate &&
                    !Number.isNaN(Date.parse(assignment.dueDate)) &&
                    new Date(assignment.dueDate) < new Date();

                  return (
                    <Link
                      key={assignment.id}
                      href={`/org/${orgSlug}/learning/assignments/${assignment.id}`}
                      className="flex items-center justify-between gap-3 px-2 py-3 hover:bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {assignment.title || "Assignment"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Assignee: {assignment.assigneeName || "—"} · Due: {due}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOverdue ? (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                            Overdue
                          </span>
                        ) : null}
                        {statusPill(assignment.status)}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No assignments yet"
                body="Assign courses to employees to track completion."
                ctaLabel="Create assignment"
                href={`/org/${orgSlug}/learning?createAssignment=1`}
              />
            )}
          </Card>

          <Card title="What’s next" icon={ArrowUpRight}>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Wire GET /learning/* endpoints to your backend.</li>
              <li>Enable assignments by role or manager.</li>
              <li>Show progress and completion rates per path.</li>
              <li>Add reminders and nudges for overdue items.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
          <Icon className="h-4 w-4 text-slate-700" />
        </span>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  ctaLabel,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
      <div className="flex items-center gap-2 text-slate-700">
        <Icon className="h-4 w-4" />
        <span className="font-semibold text-slate-900">{title}</span>
      </div>
      <p className="text-xs text-slate-500">{body}</p>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-slate-200 bg-white text-xs text-slate-800 hover:bg-slate-50"
      >
        <Link href={href}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
