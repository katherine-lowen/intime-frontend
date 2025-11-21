// src/app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <main className="p-6 space-y-6">
      <div className="h-24 max-w-3xl animate-pulse rounded-2xl bg-gray-100" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border bg-gray-50"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl border bg-gray-50 lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-2xl border bg-gray-50" />
      </div>
    </main>
  );
}
