// src/app/org/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type OrgTreeNode = {
  id: string;
  name: string;
  title?: string | null;
  status?: string | null;
  department?: string | null;
  location?: string | null;
  teamName?: string | null;
  managerId?: string | null;
  reports: OrgTreeNode[];
};

type OrgTreeResponse = {
  totalEmployees: number;
  roots: OrgTreeNode[];
};

async function getOrgTree(): Promise<OrgTreeResponse> {
  return api.get<OrgTreeResponse>("/org/tree");
}

function statusPill(status?: string | null) {
  const s = status || "ACTIVE";
  const label =
    s === "ON_LEAVE"
      ? "On leave"
      : s === "CONTRACTOR"
      ? "Contractor"
      : s === "ALUMNI"
      ? "Alumni"
      : "Active";

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {label}
    </span>
  );
}

function NodeCard({ node }: { node: OrgTreeNode }) {
  const subtitleParts: string[] = [];
  if (node.title) subtitleParts.push(node.title);
  if (node.department) subtitleParts.push(node.department);
  if (node.location) subtitleParts.push(node.location);
  const subtitle = subtitleParts.join(" • ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/people/${node.id}`}
            className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-600"
          >
            {node.name}
          </Link>
          {subtitle && (
            <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
              {subtitle}
            </div>
          )}
          {node.teamName && (
            <div className="mt-0.5 text-[11px] text-slate-500">
              Team: {node.teamName}
            </div>
          )}
        </div>
        {statusPill(node.status)}
      </div>
    </div>
  );
}

function OrgSubtree({ node, depth }: { node: OrgTreeNode; depth: number }) {
  return (
    <li className="relative">
      <div className="flex items-start gap-3">
        {depth > 0 && (
          <div className="mt-4 h-full w-px flex-1 bg-slate-200 max-w-[1px]" />
        )}
        <div className="flex-1">
          <NodeCard node={node} />
          {node.reports && node.reports.length > 0 && (
            <ul className="mt-3 space-y-3 border-l border-slate-200 pl-4">
              {node.reports.map((child) => (
                <OrgSubtree key={child.id} node={child} depth={depth + 1} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

export default async function OrgPage() {
  const tree = await getOrgTree();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400">People</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Org chart
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Reporting structure built from managers and direct reports in this
            Intime workspace.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
          <span>
            <span className="font-semibold text-slate-900">
              {tree.totalEmployees}
            </span>{" "}
            employees
          </span>
          <Link
            href="/people"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Open People directory
          </Link>
        </div>
      </header>

      {/* Org tree */}
      {tree.roots.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
          <p>No employees yet.</p>
          <p className="mt-2">
            Once you add employees and set their managers in the People
            profiles, the org chart will appear here.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4">
          <ul className="space-y-4">
            {tree.roots.map((root) => (
              <OrgSubtree key={root.id} node={root} depth={0} />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
