"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const TYPES = ["PTO", "Sick", "Unpaid"];

export default function TimeOffRequestPage() {
  const router = useRouter();
  const params = useParams() as { orgSlug?: string } | null;
  const orgSlug = params?.orgSlug;

  const { activeOrg, isLoading: authLoading } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<string>("PTO");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = activeOrg?.role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgSlug) {
      setError("Missing organization context.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select a start and end date.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await api.post("/org/time-off/request", {
        startDate,
        endDate,
        type,
        reason: reason.trim() || undefined,
      });

      router.push(`/org/${orgSlug}/time-off`);
    } catch (err: any) {
      console.error("Failed to submit time off", err);
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Unable to submit your request right now.";
      setError(typeof msg === "string" ? msg : "Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!role || (role !== "EMPLOYEE" && role !== "MANAGER")) {
    return (
      <Unauthorized
        roleLabel="employees or managers"
        fallbackHref="/org"
      />
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Time off
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Request time off
        </h1>
        <p className="text-sm text-slate-600">
          Submit a PTO or leave request to your manager and HR.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="start">Start date</Label>
            <Input
              id="start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end">End date</Label>
            <Input
              id="end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Add any context your manager should know."
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit request"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              orgSlug && router.push(`/org/${orgSlug}/time-off`)
            }
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
