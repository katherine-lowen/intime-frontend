"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/employees", label: "Employees" },
  { href: "/jobs", label: "Jobs" },
  { href: "/teams", label: "Team" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/"; // ✅ fallback prevents null error

  return (
    <div className="min-h-screen bg-surface-subtle text-text flex flex-col">
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold text-brand hover:opacity-80 transition-opacity"
          >
            Intime
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${
                    active
                      ? "text-black underline underline-offset-4"
                      : "text-neutral-600 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl p-6">{children}</main>

      <footer className="border-t bg-white text-center py-4 text-xs text-neutral-500">
        © {new Date().getFullYear()} Intime. All rights reserved.
      </footer>
    </div>
  );
}
