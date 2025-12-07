// src/app/learning/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

import { StatCard } from "./components/stat-card";
import { LearningPathItem } from "./components/learning-path-item";
import { AssignmentRow } from "./components/assignment-row";
import { CourseCard } from "./components/course-card";
import { BulkAssignModal } from "./components/BulkAssignModal";

type StatBlock = {
  activeCourses: number;
  activeLearners: number;
  avgCompletionRate: number;
  inProgress: number;
  overdue: number;
};

type LearningPath = {
  id: string;
  name: string;
  audience?: string | null;
  useCase?: string | null;
  courseCount?: number;
  totalMinutes?: number | null;
};

type Assignment = {
  id: string;
  learnerName: string;
  learnerAvatar?: string | null;
  pathOrCourse: string;
  pathId?: string | null;
  due?: string | null;
  status: "in-progress" | "overdue" | "completed" | "not-started";
};

type Course = {
  id: string;
  title: string;
  category?: string | null;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes?: number | null;
  learnerCount?: number | null;
  completionRate?: number | null;
};

type DashboardResponse = {
  stats?: Partial<StatBlock>;
  paths?: LearningPath[];
  assignments?: Assignment[];
  courses?: Course[];
};

function formatMinutes(totalMinutes?: number | null) {
  if (!totalMinutes || totalMinutes <= 0) return "~— min";
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `~${totalMinutes} min`;
}

export default function LearningPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatBlock>({
    activeCourses: 0,
    activeLearners: 0,
    avgCompletionRate: 0,
    inProgress: 0,
    overdue: 0,
  });
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.get<DashboardResponse>("/learning/dashboard");
        if (cancelled || !data) return;
        const resolvedStats: StatBlock = {
          activeCourses: data.stats?.activeCourses ?? 0,
          activeLearners: data.stats?.activeLearners ?? 0,
          avgCompletionRate: data.stats?.avgCompletionRate ?? 0,
          inProgress: data.stats?.inProgress ?? 0,
          overdue: data.stats?.overdue ?? 0,
        };
        setStats(resolvedStats);
        setPaths(data.paths ?? []);
        setAssignments(data.assignments ?? []);
        setCourses(data.courses ?? []);
      } catch (err: any) {
        if (cancelled) return;
        console.error("[learning] dashboard fetch failed", err);
        setError("We couldn’t load learning data right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const overdueBadge = useMemo(() => {
    if (!stats.overdue) return undefined;
    return { text: `${stats.overdue} overdue`, variant: "danger" as const };
  }, [stats.overdue]);

  const handlePathClick = (id: string) => {
    router.push(`/learning/paths/${id}`);
  };

  const handleNewPath = () => {
    router.push("/learning/new");
  };

  const handleBulkSuccess = () => {
    // simple refresh of dashboard data
    router.refresh();
  };

  const showSkeleton =
    loading && paths.length === 0 && assignments.length === 0 && courses.length === 0;

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <BulkAssignModal
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
          onSuccess={handleBulkSuccess}
        />
        {/* Sticky header bar */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1400px] px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">People</span>
                  <span className="text-xs text-slate-300">→</span>
                  <span className="text-xs text-slate-900">Learning</span>
                </div>
                <h1 className="mb-2 text-slate-900">Learning</h1>
                <p className="max-w-2xl text-sm text-slate-600">
                  Connect employee development to your HR workflows. Create
                  learning paths, assign training, and track completion — all
                  inside Intime.
                </p>
              </div>
              <div className="ml-6 flex items-start gap-2">
                <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700">
                  HRIS · Learning
                </span>
                <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                  Early preview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-[1400px] px-8 py-8">
          {error && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {showSkeleton ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl border border-slate-200 bg-slate-100"
                  />
                ))}
              </div>
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-5 space-y-3">
                  <div className="h-10 rounded-lg bg-slate-100" />
                  <div className="h-64 rounded-2xl border border-slate-200 bg-slate-100" />
                </div>
                <div className="col-span-7 space-y-3">
                  <div className="h-10 rounded-lg bg-slate-100" />
                  <div className="h-64 rounded-2xl border border-slate-200 bg-slate-100" />
                </div>
              </div>
              <div className="h-80 rounded-2xl border border-slate-200 bg-slate-100" />
            </div>
          ) : (
            <>
              {/* Row 1: Summary metrics */}
              <div className="mb-8 grid grid-cols-4 gap-4">
                <StatCard
                  title="Active courses"
                  value={loading ? "—" : String(stats.activeCourses)}
                  caption="Structured, trackable content"
                  icon={BookOpen}
                />
                <StatCard
                  title="Active learners"
                  value={loading ? "—" : String(stats.activeLearners)}
                  caption="People currently assigned or in progress"
                  icon={Users}
                />
                <StatCard
                  title="Avg completion rate"
                  value={
                    loading
                      ? "—"
                      : `${Math.round(stats.avgCompletionRate ?? 0)}%`
                  }
                  caption="Across all active courses"
                  icon={TrendingUp}
                  progressBar={stats.avgCompletionRate}
                />
                <StatCard
                  title="In progress · Overdue"
                  value={
                    loading
                      ? "—"
                      : `${stats.inProgress ?? 0}`
                  }
                  caption="Use this as your weekly follow-up list"
                  icon={Clock}
                  badge={overdueBadge}
                />
              </div>

              {/* Row 2: Two main panels */}
              <div className="mb-8 grid grid-cols-12 gap-6">
                {/* Left panel: Learning paths */}
                <div className="col-span-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-1 flex items-start justify-between">
                  <h2 className="text-lg text-slate-900">
                    Learning paths by lifecycle
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Bulk assign
                    </button>
                    <button
                      type="button"
                      onClick={handleNewPath}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-indigo-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New learning path
                    </button>
                  </div>
                </div>
                    <p className="mb-6 text-xs text-slate-600">
                      Bundle courses into paths for onboarding, promotions, and
                      recurring training.
                    </p>

                    <div className="mb-6 space-y-3">
                      {(paths || []).map((path) => (
                        <button
                          key={path.id}
                          type="button"
                          onClick={() => handlePathClick(path.id)}
                          className="w-full text-left transition hover:translate-x-[1px]"
                        >
                          <LearningPathItem
                            name={path.name}
                            audience={path.audience || ""}
                            useCase={path.useCase || ""}
                            courseCount={path.courseCount ?? 0}
                            duration={formatMinutes(path.totalMinutes)}
                          />
                        </button>
                      ))}
                      {!loading && paths.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                          No learning paths yet.
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                      <div className="mb-2 flex items-start gap-2">
                        <div className="mt-1.5 h-1 w-1 rounded-full bg-indigo-600" />
                        <span className="text-xs text-indigo-900">
                          Where this is headed
                        </span>
                      </div>
                      <p className="ml-3 text-xs leading-relaxed text-indigo-800">
                        Soon, you&apos;ll auto-assign paths based on role, location,
                        or performance triggers. Think &quot;promote to manager →
                        assign Manager essentials&quot; without manual work.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right panel: Assignments */}
                <div className="col-span-7">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-lg text-slate-900">
                      Assignments &amp; follow-ups
                    </h2>
                    <p className="mb-6 text-xs text-slate-600">
                      Who&apos;s been assigned what, and where you might need to
                      nudge.
                    </p>

                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                        <div className="col-span-4 text-xs uppercase tracking-wide text-slate-700">
                          Learner
                        </div>
                        <div className="col-span-4 text-xs uppercase tracking-wide text-slate-700">
                          Path / Course
                        </div>
                        <div className="col-span-2 text-xs uppercase tracking-wide text-slate-700">
                          Due
                        </div>
                        <div className="col-span-2 text-xs uppercase tracking-wide text-slate-700">
                          Status
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {(assignments || []).map((assignment) => (
                          <AssignmentRow
                            key={assignment.id}
                            {...assignment}
                            onOpen={() =>
                              assignment.pathId
                                ? handlePathClick(assignment.pathId)
                                : undefined
                            }
                          />
                        ))}
                        {!loading && assignments.length === 0 && (
                          <div className="px-4 py-6 text-center text-xs text-slate-500">
                            No assignments yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Course catalog */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h2 className="mb-1 text-lg text-slate-900">Course catalog</h2>
                    <p className="text-xs text-slate-600">
                      Your internal library of training content. Start scrappy with
                      a few essential courses, expand over time.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  {(courses || []).map((course) => (
                    <CourseCard
                      key={course.id}
                      title={course.title}
                      category={course.category || "General"}
                      difficulty={
                        (course.difficulty as Course["difficulty"]) ?? "Beginner"
                      }
                      duration={
                        formatMinutes(course.durationMinutes).replace("~", "")
                      }
                      learnerCount={course.learnerCount ?? 0}
                      completionRate={course.completionRate ?? 0}
                      onClick={() => router.push(`/learning/courses/${course.id}`)}
                    />
                  ))}
                  {!loading && courses.length === 0 && (
                    <div className="col-span-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                      No courses yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
