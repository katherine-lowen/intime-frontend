// src/components/candidate-stage-control.tsx
"use client";

import { useState } from "react";

const STAGES = [
  { value: "NEW", label: "New" },
  { value: "PHONE_SCREEN", label: "Phone screen" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";
const API_KEY = process.env.NEXT_PUBLIC_INTIME_API_KEY;

type CandidateStageControlProps = {
  candidateId: string;
  initialStage?: string | null;
};

export default function CandidateStageControl({
  candidateId,
  initialStage,
}: CandidateStageControlProps) {
  const [stage, setStage] = useState<string>(initialStage || "NEW");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = stage;

    setStage(next);
    setSaving(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Org-Id": ORG_ID,
      };
      if (API_KEY) {
        headers["X-API-Key"] = API_KEY;
      }

      const res = await fetch(`${API_URL}/candidates/${candidateId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ stage: next }),
      });

      if (!res.ok) {
        setStage(prev);
        const text = await res.text();
        console.error("Failed to update stage", res.status, text);
        setError("Failed to update stage. Try again.");
      }
    } catch (err) {
      console.error("Error updating stage", err);
      setStage(prev);
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <label className="text-[11px] font-medium text-slate-600">
        Stage
      </label>
      <div className="inline-flex items-center gap-2">
        <select
          value={stage}
          onChange={handleChange}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-sm hover:border-slate-300"
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {saving && (
          <span className="text-[10px] text-slate-400">
            Saving…
          </span>
        )}
      </div>
      {error && (
        <span className="text-[10px] text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
