// src/app/obsession/page.tsx
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-static";

export default function ObsessionPage() {
  return (
    <AuthGate>
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10">
        <div className="text-xs text-slate-400">
          <Link href="/" className="text-indigo-600 hover:underline">
            Dashboard
          </Link>{" "}
          <span className="text-slate-300">/</span>{" "}
          <span>Obsession (stub)</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Obsession (placeholder)
        </h1>

        <p className="text-sm text-slate-600">
          This page used to depend on Supabase env vars. For now, it&apos;s a
          simple placeholder so your build and deploy don&apos;t require
          NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </p>

        <p className="text-xs text-slate-500">
          Once you&apos;re ready to wire up Supabase (or whatever backend you
          want for this area), we can turn this into a real feature.
        </p>
      </main>
    </AuthGate>
  );
}
