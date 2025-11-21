// src/components/hire-applicant-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type HireResponse = {
  employeeId: string;
  candidateId: string;
  status: string;
};

export default function HireApplicantButton({
  candidateId,
}: {
  candidateId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleHire() {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post<HireResponse>(
        `/hiring/candidates/${candidateId}/hire`,
        {},
      );

      if (res && res.employeeId) {
        setDone(true);
        // Redirect straight to the new employee profile
        router.push(`/people/${res.employeeId}`);
      } else {
        setError("Unable to create employee.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to hire candidate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 text-xs">
      <button
        type="button"
        onClick={handleHire}
        disabled={loading || done}
        className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {done ? "Hired" : loading ? "Hiring…" : "Hire"}
      </button>
      {error && (
        <p className="max-w-[140px] text-[10px] text-red-600 text-right">
          {error}
        </p>
      )}
    </div>
  );
}
