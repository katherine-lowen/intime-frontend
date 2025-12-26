// src/app/employee/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type MeResponse = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  org?: { id: string; name: string };
};

type TimeoffItem = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
};

type TaskItem = {
  id: string;
  title: string;
  dueDate?: string | null;
  status?: string | null;
  category?: string | null;
};

type ReviewItem = {
  id: string;
  period: string;
  status: string;
};

type TimeOffPolicyKind = "UNLIMITED" | "FIXED" | "ACCRUAL";

type TimeOffPolicy = {
  id: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays?: number | null;
};

type TimeOffRequest = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
};

function countDaysInYearRange(startStr: string, endStr: string, year: number): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  const effectiveStart = start < yearStart ? yearStart : start;
  const effectiveEnd = end > yearEnd ? yearEnd : end;

  if (effectiveEnd < effectiveStart) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  return (
    Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / msPerDay) + 1
  );
}

export default function EmployeeHomePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [timeoff, setTimeoff] = useState<TimeoffItem[]>([]);
  const [approvedTimeoff, setApprovedTimeoff] = useState<TimeOffRequest[]>([]);
  const [policies, setPolicies] = useState<TimeOffPolicy[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [meRes, timeoffRes, tasksRes, reviewsRes, approvedRes, policiesRes] = await Promise.all([
          api.get<MeResponse>("/me"),
          api.get<{ items: TimeoffItem[] }>("/me/timeoff?upcoming=true"),
          api.get<{ items: TaskItem[] }>("/me/tasks?status=OPEN"),
          api.get<{ items: ReviewItem[] }>("/me/reviews?current=true"),
          api.get<{ items: TimeOffRequest[] }>("/me/timeoff?status=APPROVED"),
          api.get<TimeOffPolicy[]>("/timeoff/policies"),
        ]);
        if (cancelled) return;
        setMe(meRes ?? null);
        setTimeoff(timeoffRes?.items ?? []);
        setTasks(tasksRes?.items ?? []);
        setReviews(reviewsRes?.items ?? []);
        setApprovedTimeoff(approvedRes?.items ?? []);
        setPolicies(policiesRes ?? []);
      } catch (err: any) {
        if (!cancelled) {
          console.error("[employee home] fetch failed", err);
          setError("We couldn’t load your info right now.");
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

  const name = `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || "there";
  const currentYear = new Date().getFullYear();

  const allowancePolicy =
    policies.find(
      (p) => p.kind === "FIXED" || p.kind === "ACCRUAL"
    ) || null;

  const allowance =
    allowancePolicy?.annualAllowanceDays != null
      ? allowancePolicy.annualAllowanceDays
      : null;

  const approvedPtoDays = approvedTimeoff
    .filter((r) => r.status === "APPROVED" && r.type?.toUpperCase() === "PTO")
    .reduce(
      (sum, r) => sum + countDaysInYearRange(r.startDate, r.endDate, currentYear),
      0
    );

  const remaining =
    allowance != null ? Math.max(allowance - approvedPtoDays, 0) : null;

  const primaryPolicy = policies[0] ?? null;
  const isUnlimited = primaryPolicy?.kind === "UNLIMITED";

  return (
    <AuthGate>
      <div className="space-y-6">
        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Welcome, {name}
          </h1>
          <p className="text-sm text-slate-600">
            Here’s a quick snapshot of your time off, onboarding tasks, and reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <CardShell
            title="Time off balance"
            href="/employee/timeoff"
            loading={loading}
            emptyText="No time off policy assigned."
          >
            {isUnlimited ? (
              <div className="text-sm text-slate-700">
                {primaryPolicy?.name || "PTO"} ·{" "}
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Unlimited
                </span>
              </div>
            ) : allowance != null ? (
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>{allowancePolicy?.name || primaryPolicy?.name || "PTO"}</span>
                  <span className="text-xs text-slate-600">
                    {remaining} of {allowance} days remaining
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500"
                    style={{
                      width: `${
                        allowance > 0
                          ? Math.min(
                              100,
                              Math.max(
                                0,
                                Math.round(((allowance - (remaining ?? 0)) / allowance) * 100)
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Your time off balance will appear once a policy is assigned.
              </p>
            )}
          </CardShell>

          <CardShell
            title="Upcoming time off"
            href="/employee/timeoff"
            loading={loading}
            emptyText="No upcoming time off."
          >
            <ul className="space-y-2">
              {timeoff.slice(0, 3).map((t) => (
                <li key={t.id} className="text-sm text-slate-700">
                  <span className="font-medium">{t.type}</span> · {t.startDate} →{" "}
                  {t.endDate} · {t.status}
                </li>
              ))}
            </ul>
          </CardShell>

          <CardShell
            title="Open tasks"
            href="/employee/tasks"
            loading={loading}
            emptyText="No open tasks."
          >
            <ul className="space-y-2">
              {tasks.slice(0, 3).map((t) => (
                <li key={t.id} className="text-sm text-slate-700">
                  <span className="font-medium">{t.title}</span>
                  {t.dueDate ? ` · Due ${t.dueDate}` : ""}
                </li>
              ))}
            </ul>
          </CardShell>

          <CardShell
            title="Reviews"
            href="/employee/reviews"
            loading={loading}
            emptyText="No active reviews."
          >
            <ul className="space-y-2">
              {reviews.slice(0, 3).map((r) => (
                <li key={r.id} className="text-sm text-slate-700">
                  <span className="font-medium">{r.period}</span> · {r.status}
                </li>
              ))}
            </ul>
          </CardShell>
        </div>
      </div>
    </AuthGate>
  );
}

function CardShell({
  title,
  href,
  loading,
  emptyText,
  children,
}: {
  title: string;
  href: string;
  loading: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-indigo-700 hover:underline">
          View
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 rounded bg-slate-100" />
          <div className="h-3 rounded bg-slate-100" />
          <div className="h-3 rounded bg-slate-100" />
        </div>
      ) : (
        <div className="space-y-1 text-sm text-slate-700">
          {Array.isArray(children) && (children as any).length === 0 ? (
            <p className="text-sm text-slate-500">{emptyText}</p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
