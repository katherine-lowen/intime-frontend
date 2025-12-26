"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import { Badge } from "@/components/ui/badge";

type UpcomingTimeOff = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
};

type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  type: "ONBOARDING" | "PERFORMANCE" | "OTHER";
};

type MeResponse = {
  employee: {
    firstName: string;
    lastName: string;
    title?: string | null;
    teamName?: string | null;
    managerName?: string | null;
  };
  upcomingTimeOff?: UpcomingTimeOff[];
  tasks?: Task[];
};

export default function EmployeeHomePage() {
  const { activeOrg, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = activeOrg?.role;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<MeResponse>("/org/me");
        setData(res ?? null);
      } catch (err) {
        console.error("Failed to load /org/me", err);
        setError("Unable to load your data right now.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!role || (role !== "EMPLOYEE" && role !== "MANAGER")) {
    return <Unauthorized roleLabel="employees" fallbackHref="/org" />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        {error ?? "Unable to load your home dashboard."}
      </div>
    );
  }

  const { employee, upcomingTimeOff = [], tasks = [] } = data;
  const firstName = employee?.firstName || "there";

  const combinedTasks = tasks.sort((a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return da - db;
  });

  const announcements = [
    { id: "1", title: "Open enrollment starts next week", body: "Update your benefits preferences by Friday." },
    { id: "2", title: "Quarterly all-hands", body: "Join us Thursday at 1pm PT for product updates." },
  ];

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">Welcome back</p>
        <h1 className="text-3xl font-semibold text-slate-900">Hi, {firstName} 👋</h1>
        <p className="text-sm text-slate-600">
          {employee?.title ?? "Employee"}{" "}
          {employee?.teamName ? `· ${employee.teamName}` : ""}{" "}
          {employee?.managerName ? `· Manager: ${employee.managerName}` : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Upcoming time off">
          {upcomingTimeOff.length === 0 ? (
            <EmptyState text="No upcoming time off booked." />
          ) : (
            <div className="space-y-2">
              {upcomingTimeOff.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">{t.type}</div>
                    <div className="text-xs text-slate-500">
                      {formatDate(t.startDate)} → {formatDate(t.endDate)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[11px]">
                    {t.status.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Open tasks">
          {combinedTasks.length === 0 ? (
            <EmptyState text="No open tasks. Nice!" />
          ) : (
            <div className="space-y-2">
              {combinedTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {task.type.toLowerCase()}
                      {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-indigo-400" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Announcements">
          {announcements.length === 0 ? (
            <EmptyState text="No announcements right now." />
          ) : (
            <div className="space-y-2">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-600">{a.body}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
      <span>•</span>
      <span>{text}</span>
    </div>
  );
}

function formatDate(input?: string | null) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
