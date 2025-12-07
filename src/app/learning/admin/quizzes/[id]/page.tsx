// src/app/learning/admin/quizzes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { QuizBuilder, QuizForm } from "../components/QuizBuilder";

export default function EditQuizPage() {
  const params = useParams<{ id?: string }>();
  const quizId = params?.id;

  const [quiz, setQuiz] = useState<QuizForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!quizId) return;
      try {
        setLoading(true);
        const data = await api.get<QuizForm>(`/learning/admin/quizzes/${quizId}`);
        if (cancelled) return;
        // Ensure defaults for booleans/nullables
        const normalized: QuizForm = {
          id: data?.id,
          title: data?.title ?? "",
          passingScore: data?.passingScore ?? 70,
          timeLimitSeconds:
            data?.timeLimitSeconds === undefined ? null : data.timeLimitSeconds,
          allowRetry: data?.allowRetry ?? true,
          retryCooldownMinutes:
            data?.retryCooldownMinutes === undefined ? null : data.retryCooldownMinutes,
          maxAttempts: data?.maxAttempts === undefined ? null : data.maxAttempts,
          questions: (data?.questions ?? []).map((q) => ({
            id: q.id,
            prompt: q.prompt,
            options: q.options.map((opt) => ({
              id: opt.id,
              label: opt.label,
              isCorrect: Boolean((opt as any).isCorrect ?? (opt as any).correct),
              explanation: (opt as any).explanation ?? "",
              feedback: (opt as any).feedback ?? "",
            })),
          })),
        };
        setQuiz(normalized);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load quiz.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-8 py-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>People</span>
              <span className="text-slate-300">→</span>
              <span>Learning</span>
              <span className="text-slate-300">→</span>
              <span>Admin</span>
              <span className="text-slate-300">→</span>
              <span>Edit quiz</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Edit quiz
            </h1>
            <p className="text-sm text-slate-600">
              Update questions, options, and passing criteria.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
              <div className="h-48 rounded-2xl border border-slate-200 bg-slate-100" />
            </div>
          ) : quiz ? (
            <QuizBuilder mode="edit" initialQuiz={quiz} />
          ) : (
            <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Quiz not found.
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
