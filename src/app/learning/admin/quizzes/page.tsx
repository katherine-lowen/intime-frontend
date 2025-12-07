// src/app/learning/admin/quizzes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type QuizListItem = {
  id: string;
  title: string;
  passingScore?: number | null;
  questionCount?: number | null;
};

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.get<QuizListItem[]>("/learning/admin/quizzes");
        if (cancelled) return;
        setQuizzes(data ?? []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load quizzes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

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
                <span>Admin</span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Quizzes
              </h1>
              <p className="text-sm text-slate-600">
                Manage learning quizzes, passing scores, and questions.
              </p>
            </div>
            <Link
              href="/learning/admin/quizzes/new"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New quiz
            </Link>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <div className="col-span-6">Title</div>
                <div className="col-span-2">Passing</div>
                <div className="col-span-2">Questions</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              <div className="divide-y divide-slate-100">
                {quizzes.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    No quizzes yet.
                  </div>
                ) : (
                  quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-slate-800"
                    >
                      <div className="col-span-6 font-medium text-slate-900">
                        {quiz.title}
                      </div>
                      <div className="col-span-2">
                        {quiz.passingScore != null
                          ? `${quiz.passingScore}%`
                          : "—"}
                      </div>
                      <div className="col-span-2">
                        {quiz.questionCount ?? "—"}
                      </div>
                      <div className="col-span-2 text-right">
                        <Link
                          href={`/learning/admin/quizzes/${quiz.id}`}
                          className="text-xs font-semibold text-indigo-700 hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
