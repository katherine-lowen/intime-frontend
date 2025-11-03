import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intime",
  description: "Unified time intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ Top navigation bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 20px",
            borderBottom: "1px solid #e5e5e5",
            background: "#fafafa",
          }}
        >
          <a href="/" style={{ fontWeight: 700 }}>
            Intime
          </a>
          <a href="/events">Events</a>
          <a href="/events/new">Add Event</a>
          <a href="/timeline">Timeline</a>
          <a href="/admin">Admin</a>
        </header>

        {/* ✅ Main page content */}
        <main style={{ padding: "20px" }}>{children}</main>
      </body>
    </html>
  );
}
