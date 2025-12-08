// src/app/employee/layout.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/employee", label: "Home" },
  { href: "/employee/profile", label: "Profile" },
  { href: "/employee/timeoff", label: "Time off" },
  { href: "/employee/tasks", label: "Tasks / onboarding" },
  { href: "/employee/reviews", label: "Reviews" },
  { href: "/employee/documents", label: "Documents" },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true);

  const role = useMemo(() => (user?.role || "").toUpperCase(), [user?.role]);
  const isEmployee = useMemo(() => !["OWNER", "ADMIN", "MANAGER"].includes(role), [role]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const me = await getCurrentUser();
      if (cancelled) return;
      setUser(me);
      setChecking(false);

      if (!me) return;

      const isEmp = !["OWNER", "ADMIN", "MANAGER"].includes((me.role || "").toUpperCase());
      if (!isEmp) {
        // Managers/admins can view, but if they hit /employee directly it's allowed.
        return;
      }

      // Ensure employee stays under /employee namespace
      if (pathname && !pathname.startsWith("/employee")) {
        router.replace("/employee");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const name = user?.name || "";
  const orgName = user?.org?.name || "Your workspace";
  const isAdminView = !isEmployee;

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* Top bar */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{orgName}</p>
              <h1 className="text-lg font-semibold text-slate-900">
                {name ? `Hi, ${name}` : "Employee workspace"}
              </h1>
            </div>
            {isAdminView && (
              <Link
                href="/dashboard"
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Back to admin
              </Link>
            )}
          </div>
        </header>

        {/* Nav */}
        <div className="border-b border-slate-200 bg-slate-50/80">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6 py-3 text-sm">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 transition ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-6 py-8">{checking ? null : children}</main>
      </div>
    </AuthGate>
  );
}
