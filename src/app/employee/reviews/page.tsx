// src/app/employee/reviews/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type ReviewStatus =
  | "NOT_STARTED"
  | "SELF_IN_PROGRESS"
  | "SELF_SUBMITTED"
  | "MANAGER_SUBMITTED"
  | "COMPLETE";

type ReviewQuestion = {
  id: string;
  label: string;
  type: "TEXT" | "TEXTAREA" | "RATING" | "SELECT";
  options?: string[];
};

type ReviewAnswer = {
  questionId: string;
  response?: string | null;
  rating?: number | null;
  option?: string | null;
};

type Review = {
  id: string;
  cycleName?: string | null;
  period?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: ReviewStatus;
  dueDate?: string | null;
  templateId?: string | null;
  templateName?: string | null;
};

type ReviewsResponse = {
  items: Review[];
};

type ReviewDetail = Review & {
  template?: {
    id: string;
    name?: string | null;
    questions?: ReviewQuestion[];
  };
  selfAnswers?: ReviewAnswer[];
};

export default function EmployeeReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.get<ReviewsResponse>("/me/reviews");
        if (!cancelled) setReviews(data?.items ?? []);
      } catch (err: any) {
        if (!cancelled) {
          console.error("[reviews] fetch failed", err);
          setError(err?.message || "Failed to load reviews.");
          setReviews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderStatusChip = (status: ReviewStatus) => {
    const color =
      status === "COMPLETE" || status === "MANAGER_SUBMITTED"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : status === "NOT_STARTED"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : "bg-indigo-50 text-indigo-700 border-indigo-200";
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${color}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const formatPeriod = (review: Review) => {
    if (review.startDate && review.endDate) {
      try {
        return `${format(new Date(review.startDate), "MMM d, yyyy")} – ${format(
          new Date(review.endDate),
          "MMM d, yyyy"
        )}`;
      } catch {
        return `${review.startDate} – ${review.endDate}`;
      }
    }
    if (review.period) return review.period;
    return "—";
  };

  const openSelfReview = async (review: Review) => {
    try {
      const data = await api.get<ReviewDetail>(`/me/reviews/${review.id}`);
      setDetail(data ?? { ...review, template: undefined, selfAnswers: [] });
      const answerMap: Record<string, string> = {};
      data?.selfAnswers?.forEach((ans) => {
        if (ans.questionId) {
          answerMap[ans.questionId] = ans.response || ans.option || "";
        }
      });
      setAnswers(answerMap);
    } catch (err: any) {
      console.error("[reviews] detail fetch failed", err);
      setError(err?.message || "Failed to open self review.");
    }
  };

  const handleSubmit = async () => {
    if (!detail) return;
    setSubmitting(true);
    setError(null);
    try {
      const answersPayload =
        detail.template?.questions?.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] ?? "",
        })) ?? [];
      await api.post(`/me/reviews/${detail.id}/self`, { answers: answersPayload });
      setDetail(null);
      // refresh list
      const data = await api.get<ReviewsResponse>("/me/reviews");
      setReviews(data?.items ?? []);
    } catch (err: any) {
      console.error("[reviews] submit failed", err);
      setError(err?.message || "Failed to submit self review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My reviews</h1>
          <p className="text-sm text-slate-600">
            Performance reviews and status for your current and past cycles.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <div className="col-span-4">Cycle</div>
            <div className="col-span-3">Period</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {loading ? (
            <div className="space-y-2 px-4 py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No reviews yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map((r) => {
                const canStart =
                  r.status === "NOT_STARTED" || r.status === "SELF_IN_PROGRESS";
                return (
                  <div
                    key={r.id}
                    className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm text-slate-800"
                  >
                    <div className="col-span-4 font-medium text-slate-900">
                      {r.cycleName || r.templateName || "Review"}
                    </div>
                    <div className="col-span-3 text-slate-700">{formatPeriod(r)}</div>
                    <div className="col-span-3 text-slate-700">{renderStatusChip(r.status)}</div>
                    <div className="col-span-2 flex justify-end text-xs">
                      <button
                        type="button"
                        onClick={() => openSelfReview(r)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-50"
                      >
                        {canStart ? "Start / Continue" : "View"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Self review dialog */}
        {detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {detail.cycleName || "Self review"}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {formatPeriod(detail)}
                  </p>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  type="button"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {detail.template?.questions?.length ? (
                  detail.template.questions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {q.label}
                      </div>
                      {q.type === "RATING" ? (
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={answers[q.id] ?? ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="mt-2 w-24 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : q.type === "SELECT" ? (
                        <select
                          value={answers[q.id] ?? ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Select</option>
                          {(q.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <textarea
                          value={answers[q.id] ?? ""}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          rows={q.type === "TEXTAREA" ? 4 : 2}
                          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Your response"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <div className="text-sm font-semibold text-slate-900">
                      Self review
                    </div>
                    <textarea
                      value={answers["freeform"] ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, freeform: e.target.value }))
                      }
                      rows={4}
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Share your accomplishments and feedback."
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit self review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
