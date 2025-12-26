// src/components/figma/ui/HeroPanel.tsx
"use client";

import Link from "next/link";
import { orgHref } from "@/lib/org-base";


export function HeroPanel() {
  return (
    <section className="relative overflow-hidden rounded-[32px] glass-panel-3d ai-glow-layer px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      {/* optional light caustics */}
      <div className="pointer-events-none light-caustics pulse-slow absolute inset-0" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: heading + copy + primary actions */}
        <div className="max-w-xl space-y-5">
          <h1 className="gradient-text-animated text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[40px]">
            One place for people, time, and
            <br className="hidden sm:block" /> hiring health.
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Your unified view of workforce patterns, hiring flow, time-based
            signals, and AI insights — continuously refreshed.
          </p>

          {/* Primary buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={orgHref("/people")} // or "/people/new" if you have that route
              className="btn-primary-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              <span className="text-sm">+</span>
              <span>Add first employee</span>
            </Link>

            <Link
              href={orgHref("/jobs")} // or "/jobs/new"
              className="btn-holographic inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-slate-800"
            >
              <span>▢</span>
              <span>Create a role</span>
            </Link>
          </div>
        </div>

        {/* Optional right-side content (you can keep simple for now) */}
        <div className="mt-4 lg:mt-0 lg:max-w-xs">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <div className="glass-card sweep-shimmer rounded-full px-4 py-2 flex items-center gap-2 text-xs text-slate-700">
              <span className="text-sky-600">👥</span>
              <span>Employees &amp; teams</span>
            </div>
            <div className="glass-card sweep-shimmer rounded-full px-4 py-2 flex items-center gap-2 text-xs text-slate-700">
              <span className="text-violet-500">📅</span>
              <span>Events – Time off, hiring, changes</span>
            </div>
            <div className="glass-card sweep-shimmer rounded-full px-4 py-2 flex items-center gap-2 text-xs text-slate-700">
              <span className="text-emerald-500">🧠</span>
              <span>AI – Narrative insights</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
