// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="h-8 w-56 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
