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

export default function EmployeeHomePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [timeoff, setTimeoff] = useState<TimeoffItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [meRes, timeoffRes, tasksRes, reviewsRes] = await Promise.all([
          api.get<MeResponse>("/me"),
          api.get<{ items: TimeoffItem[] }>("/me/timeoff?upcoming=true"),
          api.get<{ items: TaskItem[] }>("/me/tasks?status=OPEN"),
          api.get<{ items: ReviewItem[] }>("/me/reviews?current=true"),
        ]);
        if (cancelled) return;
        setMe(meRes ?? null);
        setTimeoff(timeoffRes?.items ?? []);
        setTasks(tasksRes?.items ?? []);
        setReviews(reviewsRes?.items ?? []);
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
