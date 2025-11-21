"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900/80 p-6 text-sm text-rose-100 shadow-xl">
        <h1 className="mb-2 text-base font-semibold text-rose-100">
          Something went wrong
        </h1>
        <p className="mb-3 text-xs text-rose-200">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-400"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
