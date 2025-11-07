"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Overview" },
  { href: "/candidates", label: "Candidates" },
  { href: "/jobs", label: "Jobs" },
  { href: "/people", label: "People" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname() ?? "";
  return (
    <div className="flex h-screen flex-col p-4">
      <div className="mb-4 px-2 text-sm font-medium text-neutral-500">Navigation</div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`rounded px-3 py-2 text-sm hover:bg-neutral-100 ${active ? "bg-neutral-900 text-white" : ""}`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 text-xs text-neutral-400">© {new Date().getFullYear()} Intime</div>
    </div>
  );
}
