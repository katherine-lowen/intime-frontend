"use client";

import React from "react";
import { MoveDown, MoveUp, CheckCircle2, PlayCircle, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";

type Lesson = {
  id: string;
  title?: string | null;
  type?: string | null;
  order?: number | null;
};

export default function LearningLessonList({
  lessons,
  orgSlug,
  courseId,
  onReorder,
  renderActions,
}: {
  lessons: Lesson[];
  orgSlug?: string;
  courseId?: string;
  onReorder?: (id: string, direction: "up" | "down") => void;
  renderActions?: (lesson: Lesson) => React.ReactNode;
}) {
  if (!lessons.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
        No lessons yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
      {lessons.map((lesson, idx) => {
        const icon =
          (lesson.type || "").toUpperCase() === "VIDEO"
            ? PlayCircle
            : (lesson.type || "").toUpperCase() === "QUIZ"
              ? HelpCircle
              : FileText;
        const Icon = icon;

        return (
          <div
            key={lesson.id}
            className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {lesson.title || "Lesson"}
                </p>
                <p className="text-xs text-slate-500">
                  {(lesson.type || "").toUpperCase() || "UNKNOWN"} · #{idx + 1}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {orgSlug && courseId ? (
                <Link
                  href={`/org/${orgSlug}/learning/courses/${courseId}/learn`}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  View
                </Link>
              ) : null}

              {renderActions ? renderActions(lesson) : null}

              {onReorder ? (
                <div className="flex items-center gap-1">
                  <button
                    className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                    onClick={() => onReorder(lesson.id, "up")}
                    aria-label="Move up"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                    onClick={() => onReorder(lesson.id, "down")}
                    aria-label="Move down"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
