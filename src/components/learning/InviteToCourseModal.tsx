"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { createAssignment } from "@/lib/learning-api";

export default function InviteToCourseModal({
  open,
  onClose,
  courseId,
  orgSlug,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  orgSlug: string;
}) {
  const [email, setEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleInvite = async () => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      await createAssignment(orgSlug, {
        courseId,
        email,
        dueDate: dueDate || null,
        message: message || null,
      });
      onClose();
      setEmail("");
      setDueDate("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "Unable to send invite");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Invite to course</h2>
            <p className="text-sm text-slate-600">
              Send an email invite to this course. We&apos;ll create the assignment.
            </p>
          </div>
          <button
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="mt-3">
            <SupportErrorCard
              title="Unable to send invite"
              message={error}
              requestId={requestId}
            />
          </div>
        ) : null}

        <div className="mt-3 space-y-3">
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Email</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Due date (optional)</span>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Message (optional)</span>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading || !email}>
            {loading ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </div>
    </div>
  );
}
