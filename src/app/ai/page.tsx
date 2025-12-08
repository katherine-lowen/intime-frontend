// src/app/ai/page.tsx
"use client";

import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export default function AiLandingPage() {
  return (
    <AuthGate>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 text-slate-900">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              AI workspace
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Time-aware AI for hiring, people, and planning
            </h1>
            <p className="max-w-3xl text-sm text-slate-600">
              Navigate complex workforce decisions with an AI assistant that understands
              context, timing, and your organization. Instant answers, planning support,
              and automations in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/ai/workspace"
              className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Open AI workspace
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
