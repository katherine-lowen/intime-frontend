// src/app/learning/admin/quizzes/components/QuizBuilder.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type QuizOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation?: string;
  feedback?: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export type QuizForm = {
  id?: string;
  title: string;
  passingScore: number;
  timeLimitSeconds?: number | null;
  allowRetry: boolean;
  retryCooldownMinutes?: number | null;
  maxAttempts?: number | null;
  questions: QuizQuestion[];
};

type Props = {
  mode: "create" | "edit";
  initialQuiz?: QuizForm | null;
};

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function QuizBuilder({ mode, initialQuiz }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<QuizForm>(() => {
    if (initialQuiz) return initialQuiz;
    return {
      title: "",
      passingScore: 70,
      timeLimitSeconds: null,
      allowRetry: true,
      retryCooldownMinutes: null,
      maxAttempts: null,
      questions: [
        {
          id: uuid(),
          prompt: "New question",
          options: [
            { id: uuid(), label: "Option A", isCorrect: true, explanation: "", feedback: "" },
            { id: uuid(), label: "Option B", isCorrect: false, explanation: "", feedback: "" },
          ],
        },
      ],
    };
  });

  const canSave = useMemo(() => {
    if (!quiz.title.trim()) return false;
    if (!quiz.questions.length) return false;
    return true;
  }, [quiz.title, quiz.questions.length]);

  const updateQuizField = <K extends keyof QuizForm>(key: K, value: QuizForm[K]) => {
    setQuiz((prev) => ({ ...prev, [key]: value }));
  };

  const updateQuestion = (questionId: string, patch: Partial<QuizQuestion>) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
    }));
  };

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: uuid(),
          prompt: "New question",
          options: [
            { id: uuid(), label: "Option A", isCorrect: true, explanation: "", feedback: "" },
            { id: uuid(), label: "Option B", isCorrect: false, explanation: "", feedback: "" },
          ],
        },
      ],
    }));
  };

  const removeQuestion = (questionId: string) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const addOption = (questionId: string) => {
    updateQuestion(questionId, {
      options: [
        ...(quiz.questions.find((q) => q.id === questionId)?.options || []),
        { id: uuid(), label: "New option", isCorrect: false, explanation: "", feedback: "" },
      ],
    });
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    patch: Partial<QuizOption>
  ) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, ...patch } : opt
              ),
            }
          : q
      ),
    }));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((opt) => opt.id !== optionId),
            }
          : q
      ),
    }));
  };

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: quiz.title.trim(),
        passingScore: Number(quiz.passingScore) || 0,
        timeLimitSeconds:
          quiz.timeLimitSeconds === null || quiz.timeLimitSeconds === undefined
            ? null
            : Number(quiz.timeLimitSeconds),
        allowRetry: Boolean(quiz.allowRetry),
        retryCooldownMinutes:
          quiz.retryCooldownMinutes === null || quiz.retryCooldownMinutes === undefined
            ? null
            : Number(quiz.retryCooldownMinutes),
        maxAttempts:
          quiz.maxAttempts === null || quiz.maxAttempts === undefined
            ? null
            : Number(quiz.maxAttempts),
        questions: quiz.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            isCorrect: opt.isCorrect,
            explanation: opt.explanation ?? "",
            feedback: opt.feedback ?? "",
          })),
        })),
      };

      let quizId = quiz.id;

      if (mode === "create") {
        const created = await api.post<{ id: string }>("/learning/admin/quizzes", payload);
        quizId = created?.id;
      }

      if (!quizId) {
        throw new Error("Quiz ID missing after creation.");
      }

      await api.post(`/learning/admin/quizzes/${quizId}/full`, payload);
      router.push("/learning/admin/quizzes");
    } catch (err: any) {
      console.error("[QuizBuilder] save failed", err);
      setError(err?.message || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Quiz meta */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Quiz title</label>
              <input
                value={quiz.title}
                onChange={(e) => updateQuizField("title", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Manager essentials quiz"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Passing score (%)</label>
                <input
                  type="number"
                  value={quiz.passingScore}
                  onChange={(e) => updateQuizField("passingScore", Number(e.target.value || 0))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Time limit (seconds)
                </label>
                <input
                  type="number"
                  value={quiz.timeLimitSeconds ?? ""}
                  onChange={(e) =>
                    updateQuizField(
                      "timeLimitSeconds",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Allow retry?</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={quiz.allowRetry}
                    onChange={(e) => updateQuizField("allowRetry", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-800">Allow learners to retry</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Retry cooldown (minutes)
                </label>
                <input
                  type="number"
                  value={quiz.retryCooldownMinutes ?? ""}
                  onChange={(e) =>
                    updateQuizField(
                      "retryCooldownMinutes",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min={0}
                  disabled={!quiz.allowRetry}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Max attempts</label>
                <input
                  type="number"
                  value={quiz.maxAttempts ?? ""}
                  onChange={(e) =>
                    updateQuizField(
                      "maxAttempts",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min={1}
                  disabled={!quiz.allowRetry}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            + Add question
          </button>
        </div>

        <div className="space-y-3">
          {quiz.questions.map((question, qIndex) => (
            <div
              key={question.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-700">
                    Question {qIndex + 1}
                  </label>
                  <textarea
                    value={question.prompt}
                    onChange={(e) => updateQuestion(question.id, { prompt: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                  disabled={quiz.questions.length === 1}
                >
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">Options</span>
                  <button
                    type="button"
                    onClick={() => addOption(question.id)}
                    className="text-[11px] font-medium text-indigo-700 hover:underline"
                  >
                    + Add option
                  </button>
                </div>

                <div className="space-y-2">
                  {question.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) =>
                            updateOption(question.id, opt.id, { isCorrect: e.target.checked })
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1 space-y-2">
                          <input
                            value={opt.label}
                            onChange={(e) =>
                              updateOption(question.id, opt.id, { label: e.target.value })
                            }
                            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Option text"
                          />
                          <div className="grid gap-2 md:grid-cols-2">
                            <input
                              value={opt.explanation ?? ""}
                              onChange={(e) =>
                                updateOption(question.id, opt.id, { explanation: e.target.value })
                              }
                              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Explanation (shown after answer)"
                            />
                            <input
                              value={opt.feedback ?? ""}
                              onChange={(e) =>
                                updateOption(question.id, opt.id, { feedback: e.target.value })
                              }
                              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Feedback"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(question.id, opt.id)}
                          className="text-[11px] text-red-600 hover:text-red-700"
                          disabled={question.options.length <= 2}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/learning/admin/quizzes")}
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave || saving}
          onClick={handleSave}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : mode === "create" ? "Create quiz" : "Save quiz"}
        </button>
      </div>
    </div>
  );
}
