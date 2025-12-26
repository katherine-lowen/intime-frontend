// src/app/people/org-chart/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import { orgHref } from "@/lib/org-base";

export const dynamic = "force-dynamic";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type EmployeeListItem = {
  employeeId?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus;
  startDate?: string | null;
  manager?: {
    employeeId?: string;
    id?: string;
    firstName: string;
    lastName: string;
  } | null;
};

type OrgNode = {
  canonicalId: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus;
  manager?: {
    canonicalId: string;
    firstName: string;
    lastName: string;
  } | null;
  reports: OrgNode[];
};

async function fetchEmployees(): Promise<EmployeeListItem[]> {
  try {
    const data = await api.get<EmployeeListItem[]>("/employees");
    // Guard against api.get possibly returning undefined
    return data ?? [];
  } catch (err) {
    console.error("Failed to load /employees for org chart", err);
    return [];
  }
}

// Helper to normalize IDs and avoid "undefined" / empty strings
function normalizeId(
  primary?: string | null,
  fallback?: string | null,
): string | null {
  const clean = (v?: string | null) =>
    v && v !== "undefined" && v.trim() !== "" ? v : null;

  return clean(primary) ?? clean(fallback);
}

function buildOrgTree(employees: EmployeeListItem[]): OrgNode[] {
  if (!employees.length) return [];

  // Build base nodes with canonical ids
  const nodes = employees
    .filter((e) => e.status !== "ALUMNI") // hide alumni for v1
    .map<OrgNode | null>((e) => {
      const canonicalId = normalizeId(e.employeeId ?? null, e.id ?? null);
      if (!canonicalId) return null;

      const managerCanonicalId = normalizeId(
        e.manager?.employeeId ?? null,
        e.manager?.id ?? null,
      );

      return {
        canonicalId,
        firstName: e.firstName,
        lastName: e.lastName,
        title: e.title ?? null,
        department: e.department ?? null,
        location: e.location ?? null,
        status: e.status,
        manager: managerCanonicalId
          ? {
              canonicalId: managerCanonicalId,
              firstName: e.manager!.firstName,
              lastName: e.manager!.lastName,
            }
          : null,
        reports: [],
      };
    })
    .filter((n): n is OrgNode => n !== null); // discard any broken ones

  const byId = new Map<string, OrgNode>();
  for (const node of nodes) {
    byId.set(node.canonicalId, node);
  }

  // Wire up reports
  for (const node of nodes) {
    if (!node.manager) continue;
    const managerNode = byId.get(node.manager.canonicalId);
    if (managerNode) {
      managerNode.reports.push(node);
    }
  }

  // Roots = those whose manager isn't in the set (or no manager)
  const roots: OrgNode[] = [];
  for (const node of nodes) {
    if (!node.manager) {
      roots.push(node);
      continue;
    }
    const managerNode = byId.get(node.manager.canonicalId);
    if (!managerNode) {
      roots.push(node);
    }
  }

  // Sort roots by department/name for a stable layout
  roots.sort((a, b) => {
    const deptA = a.department ?? "";
    const deptB = b.department ?? "";
    if (deptA !== deptB) return deptA.localeCompare(deptB);
    return `${a.lastName} ${a.firstName}`.localeCompare(
      `${b.lastName} ${b.firstName}`,
    );
  });

  return roots;
}

function statusPill(status?: EmployeeStatus) {
  if (!status || status === "ACTIVE") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  if (status === "ON_LEAVE") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
        On leave
      </span>
    );
  }
  if (status === "CONTRACTOR") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
        Contractor
      </span>
    );
  }
  if (status === "ALUMNI") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
        Alumni
      </span>
    );
  }
  return null;
}

function initials(firstName: string, lastName: string) {
  const a = firstName?.[0] ?? "";
  const b = lastName?.[0] ?? "";
  return `${a}${b}`.toUpperCase();
}

function OrgBranch({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  return (
    <li className="relative">
      <div className="flex items-center gap-2 py-1">
        {depth > 0 && (
          <span className="h-px flex-1 bg-slate-200 sm:max-w-[40px]" />
        )}

        <Link
          href={`/people/${node.canonicalId}`}
          className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-sm hover:border-indigo-300 hover:bg-indigo-50"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-slate-50">
            {initials(node.firstName, node.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-semibold text-slate-900">
              {node.firstName} {node.lastName}
            </div>
            <div className="truncate text-[11px] text-slate-500">
              {node.title || "—"}
              {node.department ? ` · ${node.department}` : ""}
            </div>
          </div>
          <div className="hidden flex-col items-end gap-1 sm:flex">
            {statusPill(node.status)}
            {node.location && (
              <span className="text-[10px] text-slate-400">
                {node.location}
              </span>
            )}
          </div>
        </Link>
      </div>

      {node.reports.length > 0 && (
        <ul className="ml-6 border-l border-slate-200 pl-3">
          {node.reports
            .slice()
            .sort((a, b) =>
              `${a.lastName} ${a.firstName}`.localeCompare(
                `${b.lastName} ${b.firstName}`,
              ),
            )
            .map((child) => (
              <OrgBranch key={child.canonicalId} node={child} depth={depth + 1} />
            ))}
        </ul>
      )}
    </li>
  );
}

export default async function OrgChartPage() {
  const employees = await fetchEmployees();
  const roots = buildOrgTree(employees);

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* HEADER */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
             <Link href={orgHref("/people")}
 className="text-indigo-600 hover:underline">
                People
              </Link>
              <span className="text-slate-300">/</span>
              <span>Org chart</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Org chart
            </h1>
            <p className="text-sm text-slate-600">
              Visual view of reporting lines, managers, and teams inside Intime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
              People · Structure
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
              Read-only v1
            </span>
          </div>
        </section>

        {/* LEGEND / HELP */}
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-slate-800">How this works</div>
              <p className="mt-1">
                Managers are inferred from each employee&apos;s{" "}
                <span className="font-mono text-[11px]">manager</span> field. Each
                top-level card is a manager with their reporting tree. Click any
                person to open their full profile.
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <div>Org chart v1</div>
              <div>Future: filters, export, AI insights</div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        {roots.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            No employees found yet. Once you add employees and assign managers,
            the org chart will render here.
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roots.map((root) => (
              <div
                key={root.canonicalId}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-slate-50">
                      {initials(root.firstName, root.lastName)}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/people/${root.canonicalId}`}
                        className="block truncate text-sm font-semibold text-slate-900 hover:underline"
                      >
                        {root.firstName} {root.lastName}
                      </Link>
                      <div className="truncate text-[11px] text-slate-500">
                        {root.title || "—"}
                        {root.department ? ` · ${root.department}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {statusPill(root.status)}
                    {root.location && (
                      <span className="text-[10px] text-slate-400">
                        {root.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  {root.reports.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      No direct reports yet. Assign this person as a manager in
                      their profile to grow this branch.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      <OrgBranch node={root} depth={0} />
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </AuthGate>
  );
}
