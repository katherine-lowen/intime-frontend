import type { cookies as CookiesFn } from "next/headers";

export async function getOrgSlugFromCookies(
  cookieStore: ReturnType<typeof CookiesFn>,
  fallback?: string
): Promise<string> {
  const store = await cookieStore;
  const slug = store.get("__INTIME_ORG_SLUG__")?.value;
  return slug || fallback || "";
}
