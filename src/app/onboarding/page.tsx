// src/app/onboarding/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

import {
  Sparkles,
  FileText,
  Plus,
  Users,
  Target,
  ListTodo,
  Calendar,
  ChevronDown,
  Zap,
  FolderOpen, // <-- Add this
} from "lucide-react";

import { StatCard } from "@/components/StatCard";
import { QuickAction } from "@/components/QuickAction";

export const dynamic = "force-dynamic";

/* ---------- Types ---------- */

type OnboardingTask = {
  id: string;
  title: string;
  description?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED";
  assigneeType: "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";
  dueRelativeDays?: number | null;
  completedAt?: string | null;
};

type EmployeeLite = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  startDate?: string | null;
};

type OnboardingFlow = {
  id: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETE" | "ARCHIVED";
  startDate?: string | null;
  targetDate?: string | null;
  createdAt: string;
  employee: EmployeeLite;
  tasks: OnboardingTask[];
};

type OnboardingTemplateTask = {
  id: string;
  title: string;
  description?: string | null;
  assigneeType: string;
  dueRelativeDays?: number | null;
  sortOrder?: number | null;
};

type OnboardingTemplate = {
  id: string;
  name: string;
  description?: string | null;
  department?: string | null;
  role?: string | null;
  isDefault: boolean;
  tasks: OnboardingTemplateTask[];
  createdAt: string;
};

/* ---------- Data fetch ---------- */

async function getFlows(): Promise<OnboardingFlow[]> {
  const data = await api.get<OnboardingFlow[]>("/onboarding/flows");
  // guard against api.get possibly returning undefined
  return data ?? [];
}

async function getTemplates(): Promise<OnboardingTemplate[]> {
  const data = await api.get<OnboardingTemplate[]>("/onboarding/templates");
  // guard against api.get possibly returning undefined
  return data ?? [];
}

/* ---------- Helpers ---------- */

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function completionForFlow(flow: OnboardingFlow) {
  const total = flow.tasks?.length ?? 0;
  if (!total) return { done: 0, total: 0, percent: 0 };

  const done = flow.tasks.filter((t) => t.status === "DONE").length;
  const percent = Math.round((done / total) * 100);
  return { done, total, percent };
}

function overallCompletion(flows: OnboardingFlow[]) {
  let done = 0;
  let total = 0;
  for (const f of flows) {
    total += f.tasks?.length ?? 0;
    done += f.tasks?.filter((t) => t.status === "DONE").length ?? 0;
  }
  if (!total) return { done: 0, total: 0, percent: 0 };
  return { done, total, percent: Math.round((done / total) * 100) };
}

function upcomingStarts(flows: OnboardingFlow[], days = 7) {
  const now = new Date();
  const limit = new Date();
  limit.setDate(now.getDate() + days);

  return flows.filter((flow) => {
    const raw = flow.startDate || flow.employee?.startDate || null;
    if (!raw) return false;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return false;
    return d >= now && d <= limit;
  });
}

/* ---------- Page ---------- */

export default async function OnboardingListPage() {
  let flows: OnboardingFlow[] = [];
  let templates: OnboardingTemplate[] = [];

  try {
    [flows, templates] = await Promise.all([getFlows(), getTemplates()]);
  } catch (e) {
    console.error("Failed to load onboarding data", e);
    // render with empty arrays – UI will show empty states
  }

  const activeFlows = flows.filter((f) => f.status === "ACTIVE");
  const upcoming = upcomingStarts(flows);
  const overall = overallCompletion(flows);

  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80">
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                    <span className="w-1 h-1 rounded-full bg-indigo-500" />
                    Workspace · Onboarding
                  </span>
                </div>
                <h1 className="text-gray-900 mb-2 text-2xl font-semibold tracking-tight">
                  Onboarding
                </h1>
                <p className="text-gray-600 max-w-2xl text-sm">
                  New hires, their first 30–90 days, and the checklists that
                  keep everyone aligned.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Last updated: just now · Based on live flows
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/onboarding/templates"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-white shadow-sm"
                >
                  <FolderOpen className="w-4 h-4" />
                  Manage templates
                </Link>
                <Link
                  href="/onboarding/new"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-indigo-600"
                >
                  <Sparkles className="w-4 h-4" />
                  New AI onboarding plan
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              title="Active onboarding flows"
              value={activeFlows.length.toString()}
              description="Employees currently in journey"
              icon={<Users className="w-5 h-5" />}
              trend={
                activeFlows.length > 0
                  ? `${activeFlows.length} in progress`
                  : "No flows yet"
              }
            />
            <StatCard
              title="Overall completion"
              value={`${overall.percent}%`}
              description="Task completion across all flows"
              icon={<Target className="w-5 h-5" />}
              trend={
                overall.total === 0
                  ? "No tasks yet"
                  : `${overall.done} of ${overall.total} tasks done`
              }
            />
            <StatCard
              title="Starting in next 7 days"
              value={upcoming.length.toString()}
              description="Based on employee start dates"
              icon={<Calendar className="w-5 h-5" />}
              trend={
                upcoming.length === 0
                  ? "0 this week"
                  : `${upcoming.length} starting soon`
              }
            />
            <StatCard
              title="Templates"
              value={templates.length.toString()}
              description="Reusable onboarding blueprints"
              icon={<ListTodo className="w-5 h-5" />}
              trend={
                templates.length === 0
                  ? "No templates yet"
                  : `${templates.length} available`
              }
            />
          </div>

          {/* 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: FLOWS */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[20px] border border-gray-200/80 shadow-sm">
                {/* table header */}
                <div className="p-6 border-b border-gray-200/80">
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-gray-900 text-sm font-semibold">
                        Active onboarding flows
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                        {flows.length} total flows
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 border border-gray-200">
                        <button className="px-3 py-1 rounded-md bg-white text-xs text-gray-900 shadow-sm">
                          All
                        </button>
                        <button className="px-3 py-1 rounded-md text-xs text-gray-600 hover:text-gray-900">
                          Active
                        </button>
                        <button className="px-3 py-1 rounded-md text-xs text-gray-600 hover:text-gray-900">
                          Upcoming
                        </button>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
                        Sort by
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* body */}
                {flows.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-100/50">
                        <Users className="w-10 h-10 text-indigo-600" />
                      </div>
                      <h3 className="text-gray-900 mb-2 text-base font-semibold">
                        No onboarding flows yet
                      </h3>
                      <p className="text-sm text-gray-600 mb-8">
                        Get started by generating an AI-powered onboarding plan
                        or creating your first template.
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href="/onboarding/new"
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-indigo-600"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generate AI onboarding plan
                        </Link>
                        <Link
                          href="/onboarding/templates/new"
                          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:border-gray-400"
                        >
                          <Plus className="w-4 h-4" />
                          Create first template
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-6 py-3 text-left">Employee</th>
                          <th className="px-6 py-3 text-left">Role</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-left">Start</th>
                          <th className="px-6 py-3 text-left">Progress</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flows.map((flow) => {
                          const { done, total, percent } =
                            completionForFlow(flow);
                          const employee = flow.employee;
                          const name = `${employee.firstName} ${employee.lastName}`;
                          const subtitleParts: string[] = [];
                          if (employee.title) subtitleParts.push(employee.title);
                          if (employee.department)
                            subtitleParts.push(employee.department);
                          const subtitle = subtitleParts.join(" • ");

                          return (
                            <tr
                              key={flow.id}
                              className="border-b last:border-b-0 hover:bg-gray-50/70"
                            >
                              <td className="px-6 py-3">
                                <Link
                                  href={`/onboarding/flows/${flow.id}`}
                                  className="font-medium text-gray-900 hover:underline"
                                >
                                  {name}
                                </Link>
                                <div className="text-xs text-gray-500">
                                  {subtitle || "Team member"}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-xs text-gray-600">
                                {employee.title ?? "—"}
                              </td>
                              <td className="px-6 py-3">
                                <span
                                  className={[
                                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                    flow.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : flow.status === "DRAFT"
                                      ? "bg-gray-100 text-gray-700"
                                      : flow.status === "COMPLETE"
                                      ? "bg-indigo-50 text-indigo-700"
                                      : "bg-gray-50 text-gray-500",
                                  ].join(" ")}
                                >
                                  {flow.status.toLowerCase()}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-xs text-gray-600">
                                {formatDate(
                                  flow.startDate || employee.startDate || null,
                                )}
                              </td>
                              <td className="px-6 py-3 text-xs text-gray-700">
                                {total === 0 ? (
                                  <span className="text-gray-500">
                                    No tasks yet
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    <span>
                                      {done}/{total} tasks ({percent}%)
                                    </span>
                                    <div className="h-1 w-32 rounded-full bg-gray-100 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-indigo-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <Link
                                  href={`/onboarding/${flow.id}`}
                                  className="text-xs font-medium text-indigo-600 hover:underline"
                                >
                                  View checklist →
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: SIDE PANEL */}
            <div className="space-y-5">
              {/* Quick actions */}
              <div className="bg-white rounded-[20px] border border-gray-200/80 shadow-sm p-6">
                <div className="mb-1">
                  <h3 className="text-gray-900 text-sm font-semibold">
                    Quick actions
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-5">
                  Spin up onboarding from AI or reuse your best templates.
                </p>
                <div className="space-y-2.5">
                  <QuickAction
                    title="Generate onboarding plan with AI"
                    description="Draft a plan based on role and start date"
                    icon={<Sparkles className="w-5 h-5" />}
                    variant="primary"
                  />
                  <QuickAction
                    title="Browse onboarding templates"
                    description="View and select from existing templates"
                    icon={<FileText className="w-5 h-5" />}
                  />
                  <QuickAction
                    title="Create new template"
                    description="Build a custom checklist for your team"
                    icon={<Plus className="w-5 h-5" />}
                  />
                </div>
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Powered by Intime AI</span>
                  </div>
                </div>
              </div>

              {/* Recently created templates */}
              <div className="bg-white rounded-[20px] border border-gray-200/80 shadow-sm p-6">
                <h3 className="text-gray-900 mb-1 text-sm font-semibold">
                  Recently created templates
                </h3>

                {templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center mb-3 border border-indigo-100/50">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-xs text-gray-600">
                      No templates yet. Start with a standard new-hire
                      checklist so every onboarding feels consistent.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3 text-xs">
                    {templates.slice(0, 4).map((t) => (
                      <li
                        key={t.id}
                        className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <div>
                          <Link
                            href={`/onboarding/templates/${t.id}`}
                            className="font-medium text-gray-900 hover:underline"
                          >
                            {t.name}
                          </Link>
                          <div className="text-[11px] text-gray-500">
                            {t.department || "All departments"}
                            {t.role ? ` • ${t.role}` : ""}
                            {t.tasks?.length
                              ? ` • ${t.tasks.length} task${
                                  t.tasks.length === 1 ? "" : "s"
                                }`
                              : ""}
                          </div>
                        </div>
                        {t.isDefault && (
                          <span className="mt-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                            Default
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
