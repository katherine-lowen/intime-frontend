// src/app/events/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import AddEventForm from "@/components/add-event-form";

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary: string;
  createdAt?: string;
  employeeId?: string | null;
  jobId?: string | null;
  // hydrated in backend service from payload
  startsAt?: string;
  rating?: number | null;
};

async function getEvents(): Promise<EventItem[]> {
  // Backend exposes GET /events (internal events)
  const events = await api.get<EventItem[]>("/events");
  // api.get<T> now returns T | undefined, so normalize to []
  return events ?? [];
}

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: EventItem[] = [];

  try {
    events = await getEvents();
  } catch (err) {
    console.error("Failed to load events", err);
    return (
      <main className="p-6 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Events</h1>
            <p className="text-sm opacity-70">
              All activity across your org — hires, openings, updates, and more.
            </p>
          </div>
        </header>
        <p className="text-sm text-red-600">Failed to load events from API.</p>
      </main>
    );
  }

  const hasEvents = events.length > 0;

  // newest first – prefer startsAt, fall back to createdAt
  const sorted = [...events].sort((a, b) => {
    const aTime =
      a.startsAt || a.createdAt
        ? new Date(a.startsAt || a.createdAt!).getTime()
        : 0;
    const bTime =
      b.startsAt || b.createdAt
        ? new Date(b.startsAt || b.createdAt!).getTime()
        : 0;
    return bTime - aTime;
  });

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm opacity-70">
            All activity across your org — hires, openings, updates, and more.
          </p>
        </div>

        {/* Global Add Event entrypoint (org-level; employeeId optional) */}
        <AddEventForm />
      </header>

      {!hasEvents ? (
        <div className="mt-4 rounded border border-dashed bg-white/60 p-6 text-sm text-center text-neutral-700">
          <p className="mb-1 font-medium">No events yet</p>
          <p className="mb-3">
            Use &quot;Add event&quot; to start logging performance reviews,
            promotions, and key changes across your org.
          </p>
        </div>
      ) : (
        <ul className="mt-2 divide-y rounded border bg-white/60">
          {sorted.map((evt) => {
            // Be defensive about how job id might be stored
            const effectiveJobId =
              evt.jobId ?? (evt as any).jobId ?? (evt as any).job?.id ?? "";

            return (
              <li key={evt.id} className="flex gap-4 px-4 py-3 text-sm">
                <div className="mt-1 h-2 w-2 rounded-full bg-black" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">
                      {evt.summary || evt.type}
                    </div>
                    <span className="whitespace-nowrap text-[11px] text-neutral-500">
                      {evt.startsAt || evt.createdAt
                        ? new Date(
                            evt.startsAt || evt.createdAt!
                          ).toLocaleString()
                        : ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                    <span className="rounded-full border px-2 py-0.5 uppercase tracking-wide">
                      {evt.type.replace(/_/g, " ")}
                    </span>

                    <span>·</span>
                    <span>{evt.source}</span>

                    {typeof evt.rating === "number" && (
                      <>
                        <span>·</span>
                        <span>Rating: {evt.rating.toFixed(1)}</span>
                      </>
                    )}

                    {effectiveJobId ? (
                      <>
                        <span>·</span>
                        <Link
                          href={`/jobs/${effectiveJobId}`}
                          className="underline decoration-dotted"
                        >
                          View job
                        </Link>
                      </>
                    ) : null}

                    {evt.employeeId && (
                      <>
                        <span>·</span>
                        <Link
                          href={`/people/${evt.employeeId}`}
                          className="underline decoration-dotted"
                        >
                          View person
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
