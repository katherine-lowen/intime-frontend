"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

const STAGE_OPTIONS = [
  "applied",
  "phone screen",
  "interview",
  "onsite",
  "offer",
  "hired",
  "rejected",
];

export default function CandidateStageControls({
  candidateId,
  initialStage,
}: {
  candidateId: string;
  initialStage?: string | null;
}) {
  const [stage, setStage] = useState(initialStage ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleChange(nextStage: string) {
    setStage(nextStage);
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/candidates/${candidateId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": ORG_ID,
        },
        body: JSON.stringify({ stage: nextStage }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      // Refresh the page data
      router.refresh();
    } catch (e) {
      console.error("Failed to update stage", e);
      setError("Could not update stage.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 space-y-1 text-xs">
      <label className="text-[11px] font-medium text-slate-600">
        Update stage
      </label>
      <select
        value={stage}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
      >
        <option value="">Select stage</option>
        {STAGE_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      {error && <p className="text-[10px] text-rose-500">{error}</p>}
    </div>
  );
}
