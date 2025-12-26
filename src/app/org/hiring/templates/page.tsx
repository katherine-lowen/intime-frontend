import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOrgSlugFromCookies } from "@/lib/org-routing";

export default async function OrgHiringTemplatesAliasPage() {
  const orgSlug = await getOrgSlugFromCookies(cookies());

  if (!orgSlug) redirect("/org");

  redirect(`/org/${orgSlug}/hiring/templates`);
}
