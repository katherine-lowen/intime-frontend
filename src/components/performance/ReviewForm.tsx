"use client";

import { useMemo, useState } from "react";
import type {
  ReviewFormPayload,
  ReviewFormResponse,
  ReviewQuestion,
} from "@/lib/performance-types";
import { submitReviewResponses } from "@/lib/api-performance";

type Props = {
  reviewId: string;
  role: "SELF" | "MANAGER";
  payload: ReviewFormPayload;
};

function formatName(first?: string | null, last?: string | null) {
  const name = [first, last].filter(Boolean).join(" ");
  return name || "—";
}

export function ReviewForm({ reviewId, role, payload }: Props) {
  const [responses, setResponses] = useState<ReviewFormResponse[]>(
    payload.responses || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const responseMap = useMemo(() => {
    const map: Record<string, ReviewFormResponse> = {};
    responses.forEach((r) => {
      map[r.questionId] = r;
    });
    return map;
  }, [responses]);

  const updateResponse = (question: ReviewQuestion, value: string | number | null) => {
    setResponses((prev) => {
      const existing = prev.find((r) => r.questionId === question.id);
      const nextResp: ReviewFormResponse = { questionId: question.id };
      if (question.type === "TEXT") nextResp.textAnswer = (value as string) ?? "";
      if (question.type === "RATING") nextResp.ratingAnswer = value as number;
      if (question.type === "MULTIPLE_CHOICE") nextResp.choiceAnswer = (value as string) ?? null;
      if (existing) {
        return prev.map((r) => (r.questionId === question.id ? nextResp : r));
      }
      return [...prev, nextResp];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await submitReviewResponses(reviewId, role, responses);
      setSubmitted(true);
    } catch (err: any) {
      console.error("[review form] submit failed", err);
      setError(err?.message || "Failed to submit responses.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {payload.reviewMeta.cycleName}
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              {payload.template.name}
            </h1>
            {payload.template.description && (
              <p className="mt-1 text-sm text-slate-600">{payload.template.description}</p>
            )}
          </div>
          <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
            {role === "SELF" ? "Self review" : "Manager review"}
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-600">
          Employee: {payload.reviewMeta.employeeName} · Reviewer:{" "}
          {payload.reviewMeta.reviewerName}
        </div>
      </div>

      <div className="space-y-4">
        {payload.template.questions
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((q) => {
            const resp = responseMap[q.id];
            const baseLabel = (
              <div>
                <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                {q.helpText && (
                  <p className="text-xs text-slate-500">{q.helpText}</p>
                )}
              </div>
            );

            if (q.type === "TEXT") {
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  {baseLabel}
                  <textarea
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={4}
                    value={resp?.textAnswer ?? ""}
                    onChange={(e) => updateResponse(q, e.target.value)}
                  />
                </div>
              );
            }

            if (q.type === "RATING") {
              const min = q.minRating ?? 1;
              const max = q.maxRating ?? 5;
              const current = resp?.ratingAnswer ?? min;
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  {baseLabel}
                  <div className="mt-3 flex items-center gap-2">
                    {Array.from({ length: max - min + 1 }, (_, idx) => min + idx).map(
                      (val) => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => updateResponse(q, val)}
                          className={`h-9 w-9 rounded-full border text-sm font-semibold ${
                            current === val
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                          }`}
                        >
                          {val}
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            }

            if (q.type === "MULTIPLE_CHOICE") {
              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                >
                  {baseLabel}
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {(q.options || []).map((opt) => (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                          resp?.choiceAnswer === opt
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={resp?.choiceAnswer === opt}
                          onChange={() => updateResponse(q, opt)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })}
      </div>

      <div className="flex items-center justify-end gap-2">
        {submitted && (
          <span className="text-xs font-semibold text-emerald-600">
            Responses submitted
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}
