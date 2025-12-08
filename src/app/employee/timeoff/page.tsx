// src/app/employee/timeoff/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type TimeoffItem = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: string;
};

type TimeoffResponse = {
  items: TimeoffItem[];
};

const TIME_TYPES = ["PTO", "SICK", "PERSONAL", "UNPAID"];

export default function EmployeeTimeoffPage() {
  const [requests, setRequests] = useState<TimeoffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form
  const [type, setType] = useState("PTO");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<TimeoffResponse>("/me/timeoff");
      setRequests(data?.items ?? []);
    } catch (err: any) {
      console.error("[timeoff] fetch failed", err);
      setError(err?.message || "Failed to load time off.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !startDate || !endDate) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/me/timeoff", {
        type,
        startDate,
        endDate,
        reason: reason || null,
      });
      setReason("");
      await load();
    } catch (err: any) {
      console.error("[timeoff] create failed", err);
      setError(err?.message || "Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My time off</h1>
          <p className="text-sm text-slate-600">
            View and request time away. These requests are scoped to your account only.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        {/* Request form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Request time off</h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {TIME_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-700">Reason (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </form>
        </div>

        {/* Requests list */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Dates</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">ID</div>
          </div>
          {loading ? (
            <div className="space-y-2 px-4 py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No time off requests yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm text-slate-800"
                >
                  <div className="col-span-2 font-medium text-slate-900">{r.type}</div>
                  <div className="col-span-3 text-slate-700">
                    {r.startDate} → {r.endDate}
                  </div>
                  <div className="col-span-2 text-slate-700">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                  </div>
                  <div className="col-span-2 text-xs">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {r.status}
                    </span>
                  </div>
                  <div className="col-span-3 text-[11px] text-slate-500 break-all">
                    {r.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
