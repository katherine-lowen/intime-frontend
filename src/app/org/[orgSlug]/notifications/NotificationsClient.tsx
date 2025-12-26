"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import {
  listNotifications,
  markAllRead,
  markRead,
} from "@/lib/notifications-api";

type Notification = {
  id: string;
  title?: string;
  body?: string;
  createdAt?: string;
  status?: string;
  type?: string;
  actionUrl?: string | null;
};

export default function NotificationsClient({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"UNREAD" | "ALL">("UNREAD");
  const [rows, setRows] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listNotifications(orgSlug, { status: tab === "UNREAD" ? "UNREAD" : undefined });
        if (!cancelled) setRows(Array.isArray(res) ? res : []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load notifications");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, tab]);

  const isEmpty = useMemo(() => rows.length === 0, [rows.length]);

  const handleOpen = async (n: Notification) => {
    try {
      await markRead(orgSlug, n.id);
      setRows((prev) => prev.filter((r) => (tab === "UNREAD" ? r.id !== n.id : true)));
      if (n.actionUrl) {
        if (n.actionUrl.startsWith("http")) {
          window.location.href = n.actionUrl;
        } else {
          router.push(n.actionUrl);
        }
      }
      window.dispatchEvent(new Event("notifications:updated"));
    } catch (err: any) {
      alert(err?.message || "Unable to open");
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Notifications</p>
          <h1 className="text-2xl font-semibold text-slate-900">Notification Center</h1>
          <p className="text-sm text-slate-600">Stay on top of updates across Intime.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await markAllRead(orgSlug);
              setRows((prev) =>
                tab === "ALL" ? prev.map((r) => ({ ...r, status: "READ" })) : []
              );
              window.dispatchEvent(new Event("notifications:updated"));
            } catch (err: any) {
              alert(err?.message || "Unable to mark all read");
            }
          }}
        >
          Mark all read
        </Button>
      </div>

      {error ? <SupportErrorCard title="Notifications" message={error} requestId={requestId} /> : null}

      <div className="flex gap-2">
        {["UNREAD", "ALL"].map((t) => (
          <button
            key={t}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              tab === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
            onClick={() => setTab(t as "UNREAD" | "ALL")}
          >
            {t === "UNREAD" ? "Unread" : "All"}
          </button>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading notifications…</p>
          ) : isEmpty ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 text-center text-sm text-slate-700">
              {tab === "UNREAD" ? "No unread notifications 🎉" : "No notifications yet"}
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((n) => (
                <div
                  key={n.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge type={n.type} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{n.title || "Notification"}</p>
                      <p className="text-xs text-slate-600">{n.body || "—"}</p>
                      <p className="text-[11px] text-slate-500">{n.createdAt || ""}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {n.actionUrl ? (
                      <Button size="sm" onClick={() => void handleOpen(n)}>
                        Open <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    ) : null}
                    {n.status !== "READ" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await markRead(orgSlug, n.id);
                            setRows((prev) =>
                              tab === "UNREAD"
                                ? prev.filter((row) => row.id !== n.id)
                                : prev.map((row) => (row.id === n.id ? { ...row, status: "READ" } : row))
                            );
                            window.dispatchEvent(new Event("notifications:updated"));
                          } catch (err: any) {
                            alert(err?.message || "Unable to mark read");
                          }
                        }}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ type }: { type?: string }) {
  const map: Record<string, string> = {
    TASK: "Tasks",
    ALERT: "Alert",
    LEARNING: "Learning",
    PAYROLL: "Payroll",
  };
  const label = map[type || ""] || "Update";
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
      {label}
    </span>
  );
}
