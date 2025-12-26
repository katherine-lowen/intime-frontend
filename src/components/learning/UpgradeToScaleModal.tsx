"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function UpgradeToScaleModal({
  open,
  onClose,
  orgSlug,
}: {
  open: boolean;
  onClose: () => void;
  orgSlug?: string;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Unlock Learning at Scale</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upgrade to access premium learning capabilities.
            </p>
          </div>
          <button
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>• AI-powered quizzes, summaries, and recommendations</li>
          <li>• Advanced reporting + compliance exports (SCORM & CSV)</li>
          <li>• Company-wide leaderboards and insights</li>
        </ul>
        <div className="mt-5 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              if (orgSlug) window.location.href = `/org/${orgSlug}/settings/billing`;
              else window.location.href = "/org";
            }}
          >
            Upgrade to Scale
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              if (orgSlug) window.location.href = `/org/${orgSlug}/settings/billing`;
              else window.location.href = "/org";
            }}
          >
            View plans
          </Button>
        </div>
      </div>
    </div>
  );
}
