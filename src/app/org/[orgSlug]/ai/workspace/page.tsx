"use client";
import dynamic from "next/dynamic";

const Legacy = dynamic(() => import("@/app/ai/workspace/page"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0f] px-6 py-10 text-sm text-slate-200">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="text-lg font-semibold text-white">AI Workspace</div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">
          Loading workspace…
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return <Legacy />;
}
