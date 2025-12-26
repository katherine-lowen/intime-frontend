import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOrgSlugFromCookies } from "@/lib/org-routing";

export default async function SettingsTimeoffRedirectPage() {
  const orgSlug = await getOrgSlugFromCookies(cookies());
  redirect(`/org/${orgSlug}/settings/timeoff`);
}
