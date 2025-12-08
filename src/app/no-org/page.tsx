// src/app/no-org/page.tsx

export default function NoOrgPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Workspace setup needed
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You&apos;re signed in, but we couldn&apos;t find an active org membership.
            Ask an admin to add you, or start a new workspace.
          </p>
          <div className="mt-4 flex gap-3 text-sm">
            <a
              href="/settings"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Go to settings
            </a>
            <a
              href="/login"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Switch account
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
