import { NextRequest, NextResponse } from "next/server";

const LEGACY_PREFIXES = [
  "/people",
  "/performance",
  "/documents",
  "/timeoff",
  "/time-off",
  "/hiring",
  "/jobs",
  "/candidates",
  "/teams",
  "/analytics",
  "/settings",
  "/billing",
  "/employee-documents",
];

function isLegacyPath(pathname: string) {
  return LEGACY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function getOrgSlug(req: NextRequest) {
  return req.cookies.get("__INTIME_ORG_SLUG__")?.value || "";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Already org-scoped → allow
  if (pathname.startsWith("/org/")) {
    return NextResponse.next();
  }

  // Not a legacy route → allow
  if (!isLegacyPath(pathname)) {
    return NextResponse.next();
  }

  const orgSlug = getOrgSlug(req);
  const target = orgSlug ? `/org/${orgSlug}/dashboard` : `/org`;

  const url = req.nextUrl.clone();
  url.pathname = target;
  url.search = "";

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
