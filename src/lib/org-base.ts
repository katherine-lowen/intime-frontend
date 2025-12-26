export function getOrgBase(): string {
  const slug = (globalThis as any).__INTIME_ORG_SLUG__;
  return slug ? `/org/${slug}` : "";
}

export function orgHref(path: string): string {
  const base = getOrgBase();
  if (!path.startsWith("/")) path = `/${path}`;
  return base ? `${base}${path}` : path;
}
