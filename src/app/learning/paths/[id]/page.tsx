// src/app/learning/paths/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type LessonType = "VIDEO" | "READING" | "QUIZ";

type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  durationMinutes?: number | null;
  completed: boolean;
};

type Course = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type LearningPathDetail = {
  id: string;
  name: string;
  description?: string | null;
  audience?: string | null;
  useCase?: string | null;
  courses: Course[];
};

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return "—";
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

export default function LearningPathDetailPage() {
  const params = useParams<{ id?: string }>();
  const pathId = params?.id;

  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLessonId, setActionLessonId] = useState<string | null>(null);

  async function loadPath() {
    if (!pathId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<LearningPathDetail>(`/learning/paths/${pathId}`);
      setPath(data ?? null);
    } catch (err: any) {
      console.error("[learning path] fetch failed", err);
      setError(err?.message || "Failed to load learning path.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathId]);

  async function handleCompleteLesson(lessonId: string) {
    try {
      setActionLessonId(lessonId);
      await api.post(`/learning/lessons/${lessonId}/complete`, {});
      await loadPath();
    } catch (err: any) {
      console.error("[learning path] complete lesson failed", err);
      setError(err?.message || "Failed to mark lesson complete.");
    } finally {
      setActionLessonId(null);
    }
  }

  const showSkeleton = loading && !path && !error;

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-8 py-8">
          {/* Breadcrumbs */}
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/learning" className="hover:text-slate-700">
              People · Learning
            </Link>
            <span className="text-slate-300">→</span>
            <span className="text-slate-900">
              {path?.name || "Learning path"}
            </span>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              <p className="mb-3">{error}</p>
              <Link
                href="/learning"
                className="text-xs font-semibold text-red-800 underline"
              >
                Back to learning
              </Link>
            </div>
          )}

          {showSkeleton && (
            <div className="space-y-6 animate-pulse">
              <div className="h-28 rounded-2xl border border-slate-200 bg-slate-100" />
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-40 rounded-2xl border border-slate-200 bg-slate-100"
                  />
                ))}
              </div>
            </div>
          )}

          {!showSkeleton && !error && path && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Learning path
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                      {path.name}
                    </h1>
                    {path.description && (
                      <p className="max-w-3xl text-sm text-slate-600">
                        {path.description}
                      </p>
                    )}
                    {(path.audience || path.useCase) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {path.audience && (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700">
                            Audience: {path.audience}
                          </span>
                        )}
                        {path.useCase && (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700">
                            Use case: {path.useCase}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  Courses &amp; lessons
                </h2>
                {path.courses && path.courses.length > 0 ? (
                  <div className="space-y-4">
                    {path.courses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {course.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {course.lessons?.length ?? 0} lessons
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {(course.lessons ?? []).map((lesson) => {
                            const completed = lesson.completed;
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900">
                                      {lesson.title}
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                                      {lesson.type}
                                    </span>
                                    {completed && (
                                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                        Completed
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500">
                                    Duration: {formatDuration(lesson.durationMinutes)}
                                  </span>
                                </div>
                                {!completed && (
                                  <button
                                    type="button"
                                    disabled={actionLessonId === lesson.id}
                                    onClick={() => handleCompleteLesson(lesson.id)}
                                    className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {actionLessonId === lesson.id
                                      ? "Saving…"
                                      : "Mark complete"}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {(!course.lessons || course.lessons.length === 0) && (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                              No lessons yet.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    No courses in this path yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
