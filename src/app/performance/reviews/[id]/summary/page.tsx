"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type ResponseItem = {
  questionId?: string | null;
  question?: string | null;
  textAnswer?: string | null;
  ratingAnswer?: number | null;
  choiceAnswer?: string | null;
};

type ReviewSummary = {
  review: {
    id: string;
    status: string;
    finalRating?: string | null;
    cycleName?: string | null;
    pdfUrl?: string | null;
  };
  employee: {
    name?: string | null;
    title?: string | null;
    department?: string | null;
  };
  reviewer?: { name?: string | null } | null;
  responses?: ResponseItem[];
  aiSummary?: string | null;
  updatedAt?: string | null;
};

function getBase() {
  const inferred = (globalThis as any).__INTIME_ORG_SLUG__ as string | undefined;
  return inferred ? `/org/${inferred}` : "";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "MMM d, yyyy");
}

export const dynamic = "force-dynamic";

export default async function ReviewSummaryPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = use(params);
  const reviewId = id ?? "";
  const base = getBase();

  let summary: ReviewSummary | null = null;
  let error: string | null = null;

  if (!reviewId) {
    error = "Missing review id.";
  } else {
    try {
      summary =
        (await api.get<ReviewSummary>(`/performance/reviews/${reviewId}/summary`)) ??
        null;
    } catch (err: any) {
      console.error("[review summary] load failed", err);
      error = err?.message || "We couldn’t load this review summary right now.";
    }
  }

  return (
    <AuthGate>
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <Link
          href={`${base}/performance/reviews`}
          className="text-xs font-semibold text-indigo-700 hover:underline"
        >
          ← Back to reviews
        </Link>

        {error ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {error}
          </div>
        ) : summary ? (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Performance · Review summary
                  </p>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {summary.employee.name || "Employee review"}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {summary.employee.title || "—"}{" "}
                    {summary.employee.department
                      ? `· ${summary.employee.department}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {summary.review.finalRating && (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                      Rating: {summary.review.finalRating}
                    </span>
                  )}
                  {summary.review.pdfUrl && (
                    <a
                      href={summary.review.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Cycle: {summary.review.cycleName || "—"} · Updated{" "}
                {formatDate(summary.updatedAt)}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <h2 className="text-sm font-semibold text-slate-900">Responses</h2>
              <div className="mt-3 space-y-3">
                {summary.responses && summary.responses.length > 0 ? (
                  summary.responses.map((resp, idx) => (
                    <div
                      key={resp.questionId ?? idx}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {resp.question || "Question"}
                      </div>
                      {resp.textAnswer && (
                        <p className="mt-1 text-sm text-slate-700">
                          {resp.textAnswer}
                        </p>
                      )}
                      {resp.ratingAnswer != null && (
                        <p className="mt-1 text-sm text-slate-700">
                          Rating: {resp.ratingAnswer}
                        </p>
                      )}
                      {resp.choiceAnswer && (
                        <p className="mt-1 text-sm text-slate-700">
                          Choice: {resp.choiceAnswer}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">
                    No responses captured for this review.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <h2 className="text-sm font-semibold text-slate-900">
                AI insights
              </h2>
              {summary.aiSummary ? (
                <p className="mt-2 text-sm text-slate-700">{summary.aiSummary}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  No AI summary available yet.
                </p>
              )}
            </section>
          </>
        ) : null}
      </main>
    </AuthGate>
  );
}
