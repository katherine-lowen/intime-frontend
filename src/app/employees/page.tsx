// app/employees/page.tsx
import EmployeesClient from "./employees-client";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

async function fetchEmployees(sp: SearchParams) {
  const api = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333").replace(/\/$/, "");
  const org = process.env.NEXT_PUBLIC_ORG_ID;

  const url = new URL(`${api}/employees`);
  const q = first(sp, "q");
  const dept = first(sp, "dept");
  const loc = first(sp, "loc");
  const status = first(sp, "status");

  if (q) url.searchParams.set("q", q);
  if (dept) url.searchParams.set("dept", dept);
  if (loc) url.searchParams.set("loc", loc);
  if (status) url.searchParams.set("status", status);
  if (org) url.searchParams.set("orgId", String(org));

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as any[];
  } catch {
    // Fail-soft: return empty list so the page still renders
    return [];
  }
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const employees = await fetchEmployees(searchParams);
  return <EmployeesClient initialEmployees={employees} />;
}
