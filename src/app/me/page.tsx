// src/app/me/page.tsx
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await getCurrentUser();
  const orgId = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
          <p className="text-sm text-slate-500">
            Dev view of the user and environment this Intime workspace is using.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {/* User card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Signed-in user</h2>
          <p className="mt-1 text-xs text-slate-500">
            This comes from <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">
              getCurrentUser()
            </code>{" "}
            via NextAuth.
          </p>

          {user ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">
                  {user.name ?? "Unknown"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-mono text-xs text-slate-900">
                  {user.email ?? "unknown@example.com"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No session found. For now this page still works in demo mode; in a
              real deployment you&apos;d redirect to <code>/login</code>.
            </p>
          )}
        </section>

        {/* Environment / org card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Workspace & environment
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Quick debug info for the current Intime environment.
          </p>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Org ID</dt>
              <dd className="font-mono text-xs text-slate-900">{orgId}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">API URL</dt>
              <dd className="font-mono text-[11px] text-slate-900">{apiUrl}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
