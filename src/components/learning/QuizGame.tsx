"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { answerQuizAttempt, finishQuizAttempt, postEvent, postLessonProgress, startQuizAttempt, aiExplainAnswer } from "@/lib/learning-api";

type Question = {
  id: string;
  text: string;
  choices: { id: string; label: string; correct?: boolean; explanation?: string }[];
};

type AttemptState = {
  attemptId: string;
  questions: Question[];
  currentIndex: number;
  score: number;
  streak: number;
  finished: boolean;
  passed?: boolean;
  message?: string;
  explanations?: Record<string, string>;
};

export default function QuizGame({
  quizId,
  orgSlug,
  lessonId,
  onPassed,
}: {
  quizId: string;
  orgSlug: string;
  lessonId: string;
  onPassed: () => void;
}) {
  const [state, setState] = useState<AttemptState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  const start = async () => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const res: any = await startQuizAttempt(orgSlug, quizId, { lessonId });
      const questions: Question[] =
        res?.questions && Array.isArray(res.questions)
          ? res.questions
          : res?.data && Array.isArray(res.data)
            ? res.data
            : [];
      setState({
        attemptId: res?.attemptId || res?.id || "",
        questions,
        currentIndex: 0,
        score: 0,
        streak: 0,
        finished: false,
      });
      void postEvent(orgSlug, {
        type: "quiz_started",
        meta: { attemptId: res?.attemptId || res?.id, quizId, lessonId, at: Date.now() },
      }).catch(() => {});
    } catch (err: any) {
      setError(err?.message || "Unable to start quiz");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  const answer = async (choiceId: string) => {
    if (!state) return;
    const question = state.questions[state.currentIndex];
    try {
      const res: any = await answerQuizAttempt(orgSlug, state.attemptId, {
        questionId: question.id,
        choiceId,
      });
      const correct = !!res?.correct;
      let explanationText = explanations[question.id];
      if (!explanationText) {
        try {
          const exp = await aiExplainAnswer(orgSlug, {
            attemptId: state.attemptId,
            questionId: question.id,
            choiceId,
          });
          explanationText = exp?.explanation || exp?.text || "";
          setExplanations((prev) => ({ ...prev, [question.id]: explanationText }));
        } catch {
          // ignore if gated or unavailable
        }
      }
      setFeedback(correct ? "Correct!" : res?.explanation || "Incorrect");
      setState((prev) => {
        if (!prev) return prev;
      const nextIndex = prev.currentIndex + 1;
      return {
        ...prev,
        currentIndex: nextIndex,
        score: prev.score + (correct ? 10 : 0),
        streak: correct ? prev.streak + 1 : 0,
        finished: nextIndex >= prev.questions.length ? prev.finished : prev.finished,
        explanations: { ...(prev.explanations || {}), ...(explanationText ? { [question.id]: explanationText } : {}) },
      };
    });
    } catch (err: any) {
      setError(err?.message || "Unable to submit answer");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    }
  };

  const finish = async () => {
    if (!state) return;
    try {
      const res: any = await finishQuizAttempt(orgSlug, state.attemptId, {});
      const passed = !!res?.passed;
      setState((prev) => (prev ? { ...prev, finished: true, passed } : prev));
      if (passed) {
        try {
          await postLessonProgress(orgSlug, { lessonId, status: "COMPLETE" });
        } catch {
          // ignore
        }
        onPassed();
      }
      void postEvent(orgSlug, {
        type: "quiz_finished",
        meta: {
          attemptId: state.attemptId,
          quizId,
          lessonId,
          passed,
          score: state.score,
          at: Date.now(),
        },
      }).catch(() => {});
    } catch (err: any) {
      setError(err?.message || "Unable to finish quiz");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    }
  };

  useEffect(() => {
    void start();
  }, []);

  const question = state?.questions[state.currentIndex];
  const total = state?.questions.length ?? 0;

  useEffect(() => {
    if (state && state.currentIndex >= total && !state.finished) {
      void finish();
    }
  }, [state, total]);

  if (error) {
    return (
      <SupportErrorCard title="Quiz error" message={error} requestId={requestId} />
    );
  }

  if (!state) {
    return <div className="text-sm text-slate-600">Loading quiz…</div>;
  }

  if (state.finished) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {state.passed ? "You passed!" : "Quiz finished"}
        </h3>
        <p className="text-sm text-slate-600">
          Score: {state.score} · Streak: {state.streak}
        </p>
        <Button onClick={start}>Retry</Button>
      </div>
    );
  }

  if (!question) {
    return <div className="text-sm text-slate-600">No quiz questions.</div>;
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>
          Question {state.currentIndex + 1} of {total}
        </span>
        <span>
          Score: {state.score} · Streak: {state.streak}
        </span>
      </div>
      <div className="text-base font-semibold text-slate-900">{question.text}</div>
      <div className="grid gap-2">
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:-translate-y-0.5 hover:shadow-sm"
            onClick={() => void answer(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {feedback ? (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {feedback}
          {explanations[question.id] ? (
            <div className="mt-1 text-[11px] text-slate-500">
              Why: {explanations[question.id]}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
