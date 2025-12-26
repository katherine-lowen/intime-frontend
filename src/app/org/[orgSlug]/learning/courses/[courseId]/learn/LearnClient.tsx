"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import LearningLessonList from "@/components/learning/LearningLessonList";
import VideoLessonPlayer from "@/components/learning/VideoLessonPlayer";
import QuizGame from "@/components/learning/QuizGame";
import { getCourse, getProgress, postEvent, postLessonProgress, summarizeLesson } from "@/lib/learning-api";

type LessonType = "ARTICLE" | "VIDEO" | "QUIZ" | string;

type Lesson = {
  id: string;
  title?: string | null;
  type?: LessonType;
  content?: string | null;
  order?: number | null;
  videoAsset?: {
    videoAssetId?: string | null;
    streamUid?: string | null;
    status?: string | null;
  } | null;
  quizId?: string | null;
};

type Course = {
  id: string;
  title?: string | null;
  description?: string | null;
  lessons?: Lesson[];
};

type Progress = {
  completedLessonIds?: string[];
  status?: string | null;
};

export default function LearnClient({
  orgSlug,
  courseId,
}: {
  orgSlug: string;
  courseId: string;
}) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [courseRes, progressRes] = await Promise.all([
          getCourse(orgSlug, courseId),
          getProgress(orgSlug, courseId).catch(() => ({})),
        ]);
        if (cancelled) return;
        const lessonsList: Lesson[] = Array.isArray(courseRes?.lessons)
          ? courseRes.lessons
          : [];
        const sorted = [...lessonsList].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title?.localeCompare(b.title || "") || 0
        );
        setCourse(courseRes);
        setLessons(sorted);
        setActiveLessonId(sorted[0]?.id ?? null);
        setProgress(progressRes || {});
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load course");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [courseId, orgSlug]);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) ?? lessons[0],
    [activeLessonId, lessons]
  );

  useEffect(() => {
    if (!activeLesson) return;
    void postEvent(orgSlug, {
      type: "lesson_started",
      courseId,
      lessonId: activeLesson.id,
      meta: { at: Date.now() },
    }).catch(() => {});
  }, [activeLesson?.id, courseId, orgSlug]);

  const completedIds = progress.completedLessonIds ?? [];

  const markComplete = async (lessonId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedLessonIds: [...new Set([...(prev.completedLessonIds ?? []), lessonId])],
    }));
    try {
      await postLessonProgress(orgSlug, {
        courseId,
        lessonId,
        status: "COMPLETE",
      });
      await postEvent(orgSlug, {
        type: "lesson_completed",
        courseId,
        lessonId,
        meta: { at: Date.now() },
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <SupportErrorCard
          title="Unable to load course"
          message={error}
          requestId={requestId}
        />
      </div>
    );
  }

  if (loading || !course) {
    return <div className="p-6 text-sm text-slate-600">Loading…</div>;
  }

  return (
    <div className="grid gap-4 p-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-1">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Lessons</h2>
          <p className="text-xs text-slate-600">
            {completedIds.length}/{lessons.length} completed
          </p>
          <LearningLessonList
            lessons={lessons}
            orgSlug={orgSlug}
            courseId={courseId}
            renderActions={(lesson) => (
              <button
                className="text-xs text-indigo-600 hover:underline"
                onClick={() => setActiveLessonId(lesson.id)}
              >
                {lesson.id === activeLessonId ? "Viewing" : "Open"}
              </button>
            )}
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Lesson</p>
              <h1 className="text-lg font-semibold text-slate-900">
                {activeLesson?.title || "Lesson"}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void markComplete(activeLesson?.id || "")}
              >
                Mark complete
              </Button>
              <Button size="sm" onClick={() => router.push(`/org/${orgSlug}/learning`)}>
                Back
              </Button>
            </div>
          </div>

          {activeLesson ? (
            <LessonContent
              lesson={activeLesson}
              orgSlug={orgSlug}
              onComplete={() => void markComplete(activeLesson.id)}
            />
          ) : (
            <p className="text-sm text-slate-600">Select a lesson to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonContent({
  lesson,
  orgSlug,
  onComplete,
}: {
  lesson: Lesson;
  orgSlug: string;
  onComplete: () => void;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const type = (lesson.type || "").toUpperCase();
  if (type === "ARTICLE" || !type) {
    const handleSummarize = async () => {
      setSummarizing(true);
      setSummaryError(null);
      try {
        const res = await summarizeLesson(orgSlug, lesson.id);
        const text = res?.summary || res?.text || (typeof res === "string" ? res : null);
        setSummary(text);
      } catch (err: any) {
        if (err?.response?.status === 400) {
          setSummaryError("AI summary needs content or transcript.");
        } else {
          setSummaryError(err?.message || "Unable to summarize lesson.");
        }
      } finally {
        setSummarizing(false);
      }
    };

    return (
      <div className="space-y-3">
        <div className="prose prose-sm max-w-none text-slate-800">
          {lesson.content || "No content yet."}
        </div>
        <Button size="sm" variant="outline" onClick={() => void handleSummarize()} disabled={summarizing}>
          {summarizing ? "Summarizing…" : "AI summary"}
        </Button>
        {summaryError ? (
          <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {summaryError}
          </div>
        ) : null}
        {summary ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">Summary</p>
            <p className="text-sm text-slate-700">{summary}</p>
          </div>
        ) : null}
      </div>
    );
  }
  if (type === "VIDEO") {
    return (
      <div className="space-y-3">
        <VideoLessonPlayer lesson={lesson} orgSlug={orgSlug} />
        <Button size="sm" onClick={onComplete}>
          Mark complete
        </Button>
      </div>
    );
  }
  if (type === "QUIZ") {
    if (!lesson.quizId) {
      return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          Quiz coming next.
        </div>
      );
    }
    return (
      <QuizGame
        orgSlug={orgSlug}
        quizId={lesson.quizId}
        lessonId={lesson.id}
        onPassed={onComplete}
      />
    );
  }
  return <div className="text-sm text-slate-600">Unsupported lesson type.</div>;
}
