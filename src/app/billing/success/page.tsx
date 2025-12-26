import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: { session_id?: string };
};

const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || "https://app.hireintime.ai";

export default async function BillingSuccessPage({ searchParams }: Props) {
  const sessionId = searchParams?.session_id || "";
  if (!sessionId) {
    redirect(`${APP_BASE}/pricing`);
  }

  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${API_BASE_URL}/billing/finalize-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ sessionId }),
  });

  const data = await res.json().catch(() => null);
  const orgSlug =
    data?.org?.slug ||
    data?.orgSlug ||
    data?.slug ||
    data?.org?.id ||
    data?.orgId ||
    data?.workspaceSlug ||
    "";

  if (orgSlug) {
    redirect(`${APP_BASE}/org/${orgSlug}/getting-started`);
  }

  redirect(`${APP_BASE}/org`);
}
