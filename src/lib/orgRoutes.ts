export function orgPath(orgSlug: string, path: string) {
  return `/org/${orgSlug}${path.startsWith("/") ? path : `/${path}`}`;
}
