// src/components/right-drawer.tsx
"use client";

import * as React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  widthClass?: string; // e.g. "max-w-md" | "max-w-xl"
};

export default function RightDrawer({ open, onClose, title, children, widthClass = "max-w-xl" }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full ${widthClass} bg-white shadow-xl transition-transform duration-200
        ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-sm font-semibold">{title ?? "Details"}</h2>
          <button onClick={onClose} className="rounded border px-2 py-1 text-xs">Close</button>
        </div>
        <div className="h-[calc(100%-48px)] overflow-auto p-4">{children}</div>
      </aside>
    </>
  );
}
