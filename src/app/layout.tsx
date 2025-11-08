// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "@/context/auth";

export const metadata: Metadata = {
  title: "Intime",
  description: "Unified HR time intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        <AuthProvider>
          {/* Header */}
          <header className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold tracking-tight text-indigo-600">Intime</span>
                <span className="text-sm text-neutral-500">Platform</span>
              </Link>

              <nav className="space-x-4 text-sm font-medium">
                <Link href="/" className="hover:text-indigo-600 transition">Overview</Link>
                <Link href="/analytics" className="hover:text-indigo-600 transition">Analytics</Link>
                <Link href="/teams" className="hover:text-indigo-600 transition">Teams</Link>
                <Link href="/events" className="hover:text-indigo-600 transition">Events</Link>
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main className="min-h-[80vh]">{children}</main>

          {/* Footer */}
          <footer className="border-t border-neutral-200 bg-white mt-12">
            <div className="mx-auto max-w-6xl p-4 text-sm text-neutral-500 flex justify-between">
              <p>© {new Date().getFullYear()} Intime</p>
              <a
                href="https://intime-backend-1.onrender.com/healthz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600"
              >
                API Health
              </a>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
