// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth";

export const metadata: Metadata = {
  title: "Intime",
  description: "Unified HR time intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
