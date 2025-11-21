// src/app/(dashboard)/layout.tsx
import type { ReactNode } from "react";

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  // No extra shell here – the global layout (sidebar + top nav) already wraps us.
  return <>{children}</>;
}
