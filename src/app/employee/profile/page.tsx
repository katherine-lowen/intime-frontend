// src/app/employee/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

type MeResponse = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  manager?: { id: string; name: string } | null;
  org?: { id: string; name: string } | null;
  preferredName?: string | null;
  phone?: string | null;
};

export default function EmployeeProfilePage() {
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    const role = (me?.role || "").toUpperCase();
    return ["OWNER", "ADMIN", "MANAGER"].includes(role);
  }, [me?.role]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [user, data] = await Promise.all([
          getCurrentUser(),
          api.get<MeResponse>("/me"),
        ]);
        if (cancelled) return;
        setMe(user);
        setProfile(data ?? null);
      } catch (err: any) {
        if (!cancelled) {
          console.error("[profile] fetch failed", err);
          setError(err?.message || "Failed to load profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const name =
    profile?.preferredName ||
    `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() ||
    "Employee";

  return (
    <AuthGate>
      <div className="space-y-6">
        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">My profile</h1>
          <p className="text-sm text-slate-600">
            Basic info for your record. Edits here are limited in this preview.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-4 w-48 rounded bg-slate-100" />
              <div className="h-4 w-40 rounded bg-slate-100" />
            </div>
          ) : !profile ? (
            <p className="text-sm text-slate-600">Profile not found.</p>
          ) : (
            <div className="space-y-4 text-sm text-slate-800">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </h3>
                <p className="text-slate-900">{name}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Title" value={profile.title || "—"} />
                <Field label="Department" value={profile.department || "—"} />
                <Field label="Email" value={profile.email || "—"} />
                <Field label="Manager" value={profile.manager?.name || "—"} />
              </div>

              {isAdmin && profile.id && (
                <Link
                  href={`/people/${profile.id}`}
                  className="text-xs font-semibold text-indigo-700 hover:underline"
                >
                  View full record
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h3>
      <p className="text-slate-900">{value}</p>
    </div>
  );
}
