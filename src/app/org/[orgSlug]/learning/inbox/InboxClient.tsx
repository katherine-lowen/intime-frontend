"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { listNotifications, markNotificationRead } from "@/lib/learning-api";

type Notification = {
  id: string;
  title?: string | null;
  body?: string | null;
  href?: string | null;
  read?: boolean;
  createdAt?: string | null;
};

export default function InboxClient({ orgSlug }: { orgSlug: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listNotifications(orgSlug);
        if (!cancelled) setItems(res || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load notifications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationRead(orgSlug, id);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Notifications</p>
          <h1 className="text-2xl font-semibold text-slate-900">Learning inbox</h1>
        </div>
      </div>

      {error ? <SupportErrorCard title="Inbox error" message={error} /> : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {n.title || "Notification"}
                  </p>
                  <p className="text-xs text-slate-500">{n.body || "—"}</p>
                </div>
                <div className="flex gap-2">
                  {n.href ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={n.href}>Open</Link>
                    </Button>
                  ) : null}
                  {!n.read ? (
                    <Button size="sm" onClick={() => void markRead(n.id)}>
                      Mark read
                    </Button>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500">Read</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
