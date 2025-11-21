// src/app/people/loading.tsx
export default function PeopleLoading() {
  return (
    <main className="p-6 space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
      <div className="h-20 animate-pulse rounded border bg-gray-100" />
      <div className="space-y-2 rounded border bg-white p-4">
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      </div>
    </main>
  );
}
