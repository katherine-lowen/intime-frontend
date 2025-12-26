import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || "https://app.hireintime.ai";

type Props = {
  searchParams?: { plan?: string };
};

export default async function StartPage({ searchParams }: Props) {
  const plan = (searchParams?.plan || "growth").toLowerCase();
  const normalizedPlan = ["starter", "growth", "scale"].includes(plan) ? plan : "growth";

  const user = await getCurrentUser();
  const returnTo = `/start?plan=${encodeURIComponent(normalizedPlan)}`;
  if (!user) {
    redirect(`${APP_BASE}/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${API_BASE_URL}/billing/bootstrap-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    credentials: "include",
    body: JSON.stringify({ plan: normalizedPlan.toUpperCase() }),
    cache: "no-store",
  });

  if (!res.ok) {
    redirect(`${APP_BASE}/pricing`);
  }

  const data = await res.json().catch(() => null);
  const url = data?.url || data?.checkoutUrl;
  if (!url) {
    redirect(`${APP_BASE}/pricing`);
  }

  redirect(url);
}
