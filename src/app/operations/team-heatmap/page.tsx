// src/app/operations/team-heatmap/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

type TeamHeatmapEmployee = {
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string | null;
  managerName?: string | null;
  metrics: {
    upcomingPtoDays: number;
    pendingReviewsToGive: number;
    pendingReviewsAsReviewee: number;
    openTimeOffRequestsToApprove: number;
  };
  loadScore: number;
};

type MetricKey =
  | "loadScore"
  | "upcomingPtoDays"
  | "pendingReviewsToGive"
  | "pendingReviewsAsReviewee"
  | "openTimeOffRequestsToApprove";

const metricLabels: Record<MetricKey, string> = {
  loadScore: "Overall Load Score",
  upcomingPtoDays: "Upcoming PTO Days (30d)",
  pendingReviewsToGive: "Pending Reviews to Give",
  pendingReviewsAsReviewee: "Reviews Completed (last 30d)",
  openTimeOffRequestsToApprove: "Open Time-Off Approvals",
};

export default function TeamHeatmapPage() {
  const [data, setData] = useState<TeamHeatmapEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | "ALL">(
    "ALL",
  );
  const [metric, setMetric] = useState<MetricKey>("loadScore");

  useEffect(() => {
    let cancelled = false;

    async function fetchHeatmap() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/analytics/team-heatmap`, {
          headers: {
            "Content-Type": "application/json",
            "x-org-id": ORG_ID,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = (await res.json()) as TeamHeatmapEmployee[];
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load team heatmap");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHeatmap();
    return () => {
      cancelled = true;
    };
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    data.forEach((e) => set.add(e.department || "No Department"));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (selectedDepartment === "ALL") return data;
    if (selectedDepartment === "No Department") {
      return data.filter((e) => !e.department);
    }
    return data.filter((e) => e.department === selectedDepartment);
  }, [data, selectedDepartment]);

  const metricValues = filtered.map((e) =>
    metric === "loadScore"
      ? e.loadScore
      : e.metrics[metric as Exclude<MetricKey, "loadScore">],
  );

  const maxValue = metricValues.length ? Math.max(...metricValues) : 0;

  function getIntensityClass(value: number) {
    if (maxValue === 0) return "bg-neutral-100";
    const ratio = value / maxValue;

    if (ratio === 0) return "bg-neutral-50";
    if (ratio < 0.25) return "bg-emerald-100";
    if (ratio < 0.5) return "bg-emerald-200";
    if (ratio < 0.75) return "bg-amber-200";
    return "bg-red-300";
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Team Heatmap
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            See which teams and people are overloaded based on PTO, reviews, and
            approvals due in the next 30 days.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col text-xs text-slate-500">
            <span className="font-medium text-slate-600">Legend</span>
            <div className="mt-1 flex items-center gap-1">
              <span className="h-3 w-5 rounded bg-neutral-50" /> <span>Idle</span>
              <span className="h-3 w-5 rounded bg-emerald-200" />{" "}
              <span>Light</span>
              <span className="h-3 w-5 rounded bg-amber-200" />{" "}
              <span>Busy</span>
              <span className="h-3 w-5 rounded bg-red-300" />{" "}
              <span>Very Busy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-slate-700">Department</span>
          <select
            className="min-w-[180px] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            value={selectedDepartment}
            onChange={(e) =>
              setSelectedDepartment(e.target.value as typeof selectedDepartment)
            }
          >
            <option value="ALL">All Departments</option>
            <option value="No Department">No Department</option>
            {departments.map((d) =>
              d === "No Department" ? null : (
                <option key={d} value={d}>
                  {d}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-slate-700">Metric</span>
          <select
            className="min-w-[220px] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricKey)}
          >
            {Object.entries(metricLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-slate-500">
            Loading team heatmap…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-red-500">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-slate-500">
            No employees found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-slate-100 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Employee
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Department
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Manager
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {metricLabels[metric]}
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    PTO (30d)
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Reviews to Give
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Reviews as Reviewee
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Open PTO Approvals
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const value =
                    metric === "loadScore"
                      ? emp.loadScore
                      : emp.metrics[
                          metric as Exclude<MetricKey, "loadScore">
                        ];

                  return (
                    <tr
                      key={emp.employeeId}
                      className="border-t border-slate-100"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-slate-800 ${getIntensityClass(
                              value,
                            )}`}
                          >
                            {emp.firstName[0]}
                            {emp.lastName ? emp.lastName[0] : ""}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {emp.firstName} {emp.lastName}
                            </span>
                            {emp.managerName && (
                              <span className="text-xs text-slate-500">
                                Reports to {emp.managerName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {emp.department || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {emp.managerName || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getIntensityClass(
                            value,
                          )}`}
                        >
                          {value.toFixed(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {emp.metrics.upcomingPtoDays}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {emp.metrics.pendingReviewsToGive}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {emp.metrics.pendingReviewsAsReviewee}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {emp.metrics.openTimeOffRequestsToApprove}
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
  );
}
