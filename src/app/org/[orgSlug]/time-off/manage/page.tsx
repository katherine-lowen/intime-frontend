"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PendingRequest = {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: string;
  createdAt?: string | null;
};

export default function TimeOffManagePage() {
  const { activeOrg, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const role = activeOrg?.role;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<PendingRequest[]>("/org/time-off/manage");
      setRequests(res ?? []);
    } catch (err) {
      console.error("Failed to load approvals", err);
      setError("Unable to load pending requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const decide = async (id: string, decision: "APPROVE" | "DENY") => {
    try {
      setActioningId(id);
      await api.post(`/org/time-off/${id}/decision`, { decision });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to update request", err);
      await load();
    } finally {
      setActioningId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!role || !["MANAGER", "ADMIN", "OWNER"].includes(role)) {
    return <Unauthorized roleLabel="managers or admins" fallbackHref="/org" />;
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Time off</p>
        <h1 className="text-2xl font-semibold text-slate-900">Time off approvals</h1>
        <p className="text-sm text-slate-600">Review and action pending requests.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center px-6 py-10 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading requests...
          </div>
        ) : error ? (
          <div className="px-6 py-10 text-sm text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            No pending time off requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-3 text-slate-900 font-medium">
                      {r.employeeName}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {formatDate(r.startDate)} → {formatDate(r.endDate)}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{r.type}</td>
                    <td className="px-6 py-3 text-slate-700">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actioningId === r.id}
                          onClick={() => decide(r.id, "DENY")}
                        >
                          Deny
                        </Button>
                        <Button
                          size="sm"
                          disabled={actioningId === r.id}
                          onClick={() => decide(r.id, "APPROVE")}
                        >
                          {actioningId === r.id ? "Saving..." : "Approve"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(input?: string | null) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
