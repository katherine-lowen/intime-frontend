"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";

export type OrgMembership = {
  orgId: string;
  orgName: string;
  orgSlug: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE" | string;
  plan?: string;
  isDefault?: boolean;
};

type OrgsResponse = OrgMembership[] | { items?: OrgMembership[] } | { data?: OrgMembership[] };

const LAST_ORG_KEY = "__INTIME_LAST_ORG__";

let orgCache: OrgMembership[] | null = null;
let orgPromise: Promise<OrgMembership[]> | null = null;

function normalizeOrgs(res?: OrgsResponse): OrgMembership[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as any).items)) return (res as any).items;
  if (Array.isArray((res as any).data)) return (res as any).data;
  return [];
}

async function loadOrgs(): Promise<OrgMembership[]> {
  if (orgCache) return orgCache;
  if (orgPromise) return orgPromise;
  orgPromise = (async () => {
    try {
      const data = await api.get<OrgsResponse>("/me/orgs");
      orgCache = normalizeOrgs(data);
      orgPromise = null;
      return orgCache;
    } catch (err: any) {
      orgPromise = null;
      if (err?.code === "UNAUTHORIZED" || err?.status === 401) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return [];
      }
      throw err;
    }
  })();
  return orgPromise;
}

function setOrgSlugCookie(slug: string) {
  try {
    document.cookie = `__INTIME_ORG_SLUG__=${encodeURIComponent(
      slug
    )}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  } catch {}
}

function persistLastOrg(slug: string) {
  try {
    window.localStorage.setItem(LAST_ORG_KEY, slug);
  } catch {}
}

function readLastOrg(): string | null {
  try {
    return window.localStorage.getItem(LAST_ORG_KEY);
  } catch {
    return null;
  }
}

export function useCurrentOrg() {
  const params = useParams<{ orgSlug?: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const orgSlugParam = params?.orgSlug ?? null;

  const [orgs, setOrgs] = useState<OrgMembership[]>(orgCache ?? []);
  const [loading, setLoading] = useState(!orgCache);

  useEffect(() => {
    let mounted = true;
    if (orgCache) {
      setLoading(false);
      return;
    }
    loadOrgs()
      .then((items) => {
        if (!mounted) return;
        setOrgs(items);
      })
      .catch((err) => {
        console.error("[useCurrentOrg] failed to load orgs", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const current = useMemo(() => {
    if (!orgs.length) return null;
    if (orgSlugParam) {
      return (
        orgs.find(
          (o) =>
            o.orgSlug.toLowerCase() === orgSlugParam.toLowerCase() ||
            o.orgId === orgSlugParam
        ) || null
      );
    }
    const last = typeof window !== "undefined" ? readLastOrg() : null;
    if (last) {
      const found = orgs.find((o) => o.orgSlug === last);
      if (found) return found;
    }
    return orgs.find((o) => o.isDefault) || orgs[0] || null;
  }, [orgSlugParam, orgs]);

  useEffect(() => {
    if (loading) return;
    // If user is on /org (no slug), redirect to remembered or first org
    if (!orgSlugParam && orgs.length === 1 && pathname?.startsWith("/org")) {
      const target = orgs[0].orgSlug;
      persistLastOrg(target);
      setOrgSlugCookie(target);
      (globalThis as any).__INTIME_ORG_SLUG__ = target;
      router.replace(`/org/${target}/getting-started`);
    }
    // If slug is present but invalid, send to org picker
    if (orgSlugParam && orgs.length && !current) {
      router.replace("/org");
    }
  }, [current, loading, orgSlugParam, orgs.length, pathname, router]);

  useEffect(() => {
    if (!current?.orgSlug) return;
    (globalThis as any).__INTIME_ORG_SLUG__ = current.orgSlug;
    setOrgSlugCookie(current.orgSlug);
    persistLastOrg(current.orgSlug);
  }, [current?.orgSlug]);

  const switchOrg = useCallback(
    (slug: string) => {
      if (!slug) return;
      persistLastOrg(slug);
      setOrgSlugCookie(slug);
      (globalThis as any).__INTIME_ORG_SLUG__ = slug;
      router.push(`/org/${slug}/getting-started`);
    },
    [router]
  );

  const role = (current?.role || "").toUpperCase();
  const flags = {
    isOwner: role === "OWNER",
    isAdmin: role === "ADMIN" || role === "OWNER",
    isManager: role === "MANAGER",
    isEmployee: role === "EMPLOYEE",
  };

  return {
    orgId: current?.orgId ?? null,
    orgSlug: current?.orgSlug ?? null,
    orgName: current?.orgName ?? null,
    role,
    ...flags,
    orgs,
    loading,
    switchOrg,
  };
}
