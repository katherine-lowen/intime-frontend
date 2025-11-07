"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname() ?? ""; // avoid 'possibly null' warnings
  const link = "rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100";
  const is = (p: string) => (pathname === p || pathname.startsWith(p + "/") ? "bg-neutral-900 text-white" : "");
  return (
    <div className="sticky top-0 z-30 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-6">
        <div className="font-semibold">Intime</div>
        <nav className="ml-6 flex items-center gap-2">
          <Link href="/" className={`${link} ${is("/")}`}>Overview</Link>
          <Link href="/candidates" className={`${link} ${is("/candidates")}`}>Candidates</Link>
          <Link href="/jobs" className={`${link} ${is("/jobs")}`}>Jobs</Link>
          <Link href="/people" className={`${link} ${is("/people")}`}>People</Link>
          <Link href="/settings" className={`${link} ${is("/settings")}`}>Settings</Link>
        </nav>
        <div className="ml-auto" />
      </div>
    </div>
  );
}
