export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 shadow-lg">
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-700" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800" />
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Loading your Intime workspace&hellip;
        </p>
      </div>
    </div>
  );
}
