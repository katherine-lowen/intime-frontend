"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function DemoBanner() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Delayed mount → slide-down animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    setHidden(true);
    setTimeout(() => setMounted(false), 220); // match duration
  }

  if (!mounted) return null;

  return (
    <div
      className={[
        "w-full flex items-start gap-3 px-4 py-3 text-sm transition-all duration-200",
        hidden ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0",
        // High-contrast, visible on dark pages
        "bg-amber-50 border-b border-amber-300 text-amber-950 shadow-md shadow-amber-200/70",
      ].join(" ")}
    >
      {/* Green dot */}
      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />

      {/* Text */}
      <div className="flex-1 leading-tight">
        <strong className="font-semibold">
          Demo mode enabled.
        </strong>{" "}
        <span className="text-amber-800">
          (Auth flow still shipping.)
        </span>
        <br />
        <span className="text-amber-900">
          If you&apos;re testing Intime (👋 YC reviewer / demo viewer),
          skip signup and just hit{" "}
          <span className="font-semibold underline decoration-amber-700">
            Log in
          </span>{" "}
          to jump straight into the demo workspace.
        </span>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 text-amber-700 hover:text-amber-900"
        aria-label="Dismiss demo notice"
      >
        <X size={16} />
      </button>
    </div>
  );
}
