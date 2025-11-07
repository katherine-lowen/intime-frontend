"use client";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-white text-neutral-900">
      <aside className="border-r bg-neutral-50"><Sidebar /></aside>
      <main className="flex min-w-0 flex-col bg-white">
        <TopNav />
        <div className="mx-auto w-full max-w-7xl flex-1 p-6 bg-white">{children}</div>
      </main>
    </div>
  );
}
