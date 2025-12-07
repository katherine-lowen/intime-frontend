// src/app/learning/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type TrendPoint = {
  label: string;
  value: number;
};

type TopCourse = {
  id: string;
  title: string;
  completionRate: number;
  learners: number;
};

type TopLearner = {
  id: string;
  name: string;
  completed: number;
  inProgress: number;
};

type AnalyticsResponse = {
  completionTrend: TrendPoint[];
  topCourses: TopCourse[];
  topLearners: TopLearner[];
};

export default function LearningAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [topLearners, setTopLearners] = useState<TopLearner[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.get<AnalyticsResponse>("/learning/analytics");
        if (cancelled || !data) return;
        setTrend(data.completionTrend ?? []);
        setTopCourses(data.topCourses ?? []);
        setTopLearners(data.topLearners ?? []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load analytics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const showSkeleton = loading && !error && trend.length === 0;

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-8 py-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>People</span>
                <span className="text-slate-300">→</span>
                <span>Learning</span>
                <span className="text-slate-300">→</span>
                <span>Analytics</span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Learning analytics
              </h1>
              <p className="text-sm text-slate-600">
                Track completion trends, top courses, and your best learners.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {showSkeleton ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-64 rounded-2xl border border-slate-200 bg-slate-100" />
              <div className="grid grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-2xl border border-slate-200 bg-slate-100"
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Completion trend */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Completion trend
                    </h2>
                    <p className="text-xs text-slate-600">
                      How completion rates are moving over time.
                    </p>
                  </div>
                </div>
                {trend.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    No trend data yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-12 gap-2">
                    {trend.map((point) => (
                      <div
                        key={point.label}
                        className="col-span-1 flex flex-col items-center justify-end"
                      >
                        <div
                          className="w-full rounded-t-md bg-indigo-500"
                          style={{ height: `${Math.max(point.value, 2)}px` }}
                          title={`${point.value}%`}
                        />
                        <span className="mt-1 text-[10px] text-slate-500">
                          {point.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tables */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Top courses
                  </h3>
                  <p className="text-xs text-slate-600">
                    Highest completion rates and engagement.
                  </p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      <div className="col-span-6">Course</div>
                      <div className="col-span-3">Completion</div>
                      <div className="col-span-3">Learners</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {topCourses.length === 0 ? (
                        <div className="px-3 py-3 text-center text-xs text-slate-500">
                          No courses yet.
                        </div>
                      ) : (
                        topCourses.map((course) => (
                          <div
                            key={course.id}
                            className="grid grid-cols-12 gap-4 px-3 py-2 text-sm text-slate-800"
                          >
                            <div className="col-span-6 font-medium text-slate-900">
                              {course.title}
                            </div>
                            <div className="col-span-3">
                              {Math.round(course.completionRate)}%
                            </div>
                            <div className="col-span-3">
                              {course.learners ?? "—"}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Top learners
                  </h3>
                  <p className="text-xs text-slate-600">
                    Who’s completing the most learning.
                  </p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      <div className="col-span-6">Learner</div>
                      <div className="col-span-3">Completed</div>
                      <div className="col-span-3">In progress</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {topLearners.length === 0 ? (
                        <div className="px-3 py-3 text-center text-xs text-slate-500">
                          No learners yet.
                        </div>
                      ) : (
                        topLearners.map((learner) => (
                          <div
                            key={learner.id}
                            className="grid grid-cols-12 gap-4 px-3 py-2 text-sm text-slate-800"
                          >
                            <div className="col-span-6 font-medium text-slate-900">
                              {learner.name}
                            </div>
                            <div className="col-span-3">{learner.completed}</div>
                            <div className="col-span-3">{learner.inProgress}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
