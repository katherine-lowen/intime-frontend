"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function DemoBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Small delayed mount to animate slide-down
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    setDismissed(true);
    setTimeout(() => {
      setVisible(false);
    }, 250); // match transition duration
  }

  if (!visible) return null;

  return (
    <div
      className={[
        "w-full border-b flex items-start gap-3 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-300",
        dismissed
          ? "opacity-0 -translate-y-4"
          : "opacity-100 translate-y-0",

        // Colors / style + slight drop shadow
        "bg-indigo-950/60 border-indigo-900 text-indigo-200 shadow-md shadow-black/40",
      ].join(" ")}
    >
      {/* Green dot */}
      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />

      {/* Messaging */}
      <div className="flex-1 leading-tight">
        <strong className="font-semibold text-indigo-100">
          Demo mode enabled.
        </strong>{" "}
        <span className="text-indigo-300">
          (Auth flow still shipping.)
        </span>
        <br />
        <span className="text-indigo-400">
          If you&apos;re testing Intime (👋 YC reviewer / demo viewer),
          skip signup and just hit{" "}
          <span className="font-medium text-white">&quot;Log in&quot;</span>{" "}
          to jump straight into the demo workspace.
        </span>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="text-indigo-300 hover:text-white transition p-1"
        aria-label="Dismiss demo notice"
      >
        <X size={16} />
      </button>
    </div>
  );
}
