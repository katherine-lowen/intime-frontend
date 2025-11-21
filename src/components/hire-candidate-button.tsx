// src/components/hire-candidate-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export default function HireCandidateButton({
  candidateId,
}: {
  candidateId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/candidates/${candidateId}/hire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": ORG_ID,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const employee = await res.json();
      // Assuming employee.id exists and /people/[id] route is wired
      router.push(`/people/${employee.id}`);
    } catch (e: any) {
      console.error("Failed to hire candidate", e);
      setError("Something went wrong hiring this candidate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Hiring…" : "Hire into Intime"}
      </button>
      {error && (
        <p className="max-w-xs text-[10px] text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}
