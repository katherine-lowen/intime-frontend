// src/app/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // YC-safe behavior: always land on admin dashboard after auth
  redirect("/dashboard");
}
