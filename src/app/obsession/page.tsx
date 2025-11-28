// src/app/obsession/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ObsessionEvent = {
  id: string;
  created_at: string;
  action: string;
  status: "ATTEMPTED" | "SUCCESS" | "FAILED" | string;
  payload: unknown;
  error?: string | null;
};

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }) +
      " · " +
      d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } catch {
    return iso;
  }
}

function statusClasses(status: string) {
  if (status === "SUCCESS") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (status === "FAILED") {
    return "bg-rose-50 text-rose-700 border-rose-100";
  }
  if (status === "ATTEMPTED") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  return "bg-slate-50 text-slate-700 border-slate-100";
}

export default async function ObsessionPage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("obsession_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const events = (data ?? []) as ObsessionEvent[];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            INTIME · INTERNAL
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Obsession log
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Every time you create a job, onboarding flow, time off request,
            employee document, or team, it shows up here. Use this to debug
            flows, see failures, and track real usage.
          </p>
        </div>
      </header>

      {/* Error state */}
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load obsession events from Supabase: {error.message}
        </div>
      )}

      {/* Empty state */}
      {!error && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">
            No events yet in your obsession log.
          </p>
          <p className="mt-1">
            Try creating a job, onboarding flow, time off request, employee
            document, or team — then come back here.
          </p>
        </div>
      )}

      {/* Events list */}
      {events.length > 0 && (
        <section className="space-y-3">
          {events.map((evt) => {
            const payloadPreview = (() => {
              try {
                return JSON.stringify(evt.payload, null, 2);
              } catch {
                return String(evt.payload ?? "");
              }
            })();

            return (
              <article
                key={evt.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide text-slate-700">
                      {evt.action}
                    </span>
                    <span
                      className={
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold " +
                        statusClasses(evt.status)
                      }
                    >
                      {evt.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDateTime(evt.created_at)}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  {/* Payload */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Payload
                    </p>
                    <pre className="max-h-48 overflow-auto rounded-lg bg-slate-950/95 px-3 py-2 text-[11px] leading-relaxed text-slate-100">
                      {payloadPreview}
                    </pre>
                  </div>

                  {/* Error (if any) */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Error
                    </p>
                    {evt.error ? (
                      <div className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                        {evt.error}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                        No error recorded.
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
