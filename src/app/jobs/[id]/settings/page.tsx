// src/app/jobs/[id]/settings/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type JobSettings = {
  id: string;
  title: string;
  visibility?: "PUBLIC" | "INTERNAL";
  isAiEnabled?: boolean;
  hiringTeamUserIds?: string[];
};

export default function JobSettingsPage() {
  const params = useParams<{ id?: string }>();
  const jobId = params?.id;

  const [role, setRole] = useState<string | null>(null);
  const [job, setJob] = useState<JobSettings | null>(null);
  const [visibility, setVisibility] = useState<"PUBLIC" | "INTERNAL" | "">("");
  const [isAiEnabled, setIsAiEnabled] = useState<boolean>(false);
  const [hiringTeam, setHiringTeam] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEmployee = useMemo(
    () => !["OWNER", "ADMIN", "MANAGER"].includes((role || "").toUpperCase()),
    [role]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await getCurrentUser();
        if (!cancelled) setRole((me?.role || "").toUpperCase());

        if (!jobId) {
          setError("Missing job id.");
          setLoading(false);
          return;
        }

        const data = await api.get<JobSettings>(`/jobs/${jobId}`);
        if (!cancelled) {
          setJob(data ?? null);
          if (data) {
            setVisibility((data.visibility as any) || "INTERNAL");
            setIsAiEnabled(Boolean(data.isAiEnabled));
            setHiringTeam((data.hiringTeamUserIds || []).join(", "));
          } else {
            setError("Job not found.");
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[job settings] fetch failed", err);
          setError(err?.message || "Failed to load job settings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee || !jobId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const teamIds = hiringTeam
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      await api.patch(`/jobs/${jobId}`, {
        visibility: visibility || "INTERNAL",
        isAiEnabled,
        hiringTeamUserIds: teamIds,
      });
      setSuccess("Settings saved.");
    } catch (err: any) {
      console.error("[job settings] save failed", err);
      setError(err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Hiring · Job settings
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                {job?.title || "Job settings"}
              </h1>
              <p className="text-sm text-slate-600">
                Manage visibility, hiring team, and AI features.
              </p>
            </div>
            <Link
              href={`/jobs/${jobId ?? ""}/pipeline`}
              className="text-xs font-semibold text-indigo-700 hover:underline"
            >
              ← Back to pipeline
            </Link>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-40 rounded bg-slate-100" />
              <div className="h-32 rounded bg-slate-100" />
            </div>
          ) : isEmployee ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have permission to edit job settings.
            </div>
          ) : (
            <form
              onSubmit={handleSave}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {success && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {success}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "INTERNAL" | "")}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="INTERNAL">Internal</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  checked={isAiEnabled}
                  onChange={(e) => setIsAiEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Enable AI features (match, JD suggestions)
              </label>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Hiring team user IDs (comma-separated)
                </label>
                <textarea
                  value={hiringTeam}
                  onChange={(e) => setHiringTeam(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="user_123, user_456"
                />
                <p className="text-[11px] text-slate-500">
                  These users will be collaborators on this job.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save settings"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
