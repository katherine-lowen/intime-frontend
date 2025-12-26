import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import Link from "next/link";

export const dynamic = "force-dynamic";

type ReviewRating =
  | "Needs improvement"
  | "Meets expectations"
  | "Exceeds expectations"
  | "Outstanding"
  | string
  | null
  | undefined;

type Review = {
  id: string;
  period?: string | null;
  rating?: ReviewRating;
  createdAt?: string | null;
  employee?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    title?: string | null;
    department?: string | null;
  } | null;
};

function ratingBadge(rating: ReviewRating) {
  if (!rating) {
    return (
      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        Unrated
      </span>
    );
  }

  const base =
    "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium";

  const styles: Record<string, string> = {
    "Needs improvement": "border-rose-200 bg-rose-50 text-rose-800",
    "Meets expectations": "border-slate-200 bg-slate-50 text-slate-700",
    "Exceeds expectations": "border-emerald-200 bg-emerald-50 text-emerald-800",
    Outstanding: "border-indigo-200 bg-indigo-50 text-indigo-800",
  };

  return (
    <span className={`${base} ${styles[rating] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
      {rating}
    </span>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function getEmployeeName(e: Review["employee"]) {
  if (!e) return "Employee";
  return (
    [e.firstName, e.lastName].filter(Boolean).join(" ") ||
    e.email ||
    "Employee"
  );
}

async function getReviews(): Promise<Review[]> {
  try {
    const reviews = await api.get<Review[]>("/performance-reviews");
    return reviews ?? [];
  } catch (err) {
    console.error("Failed to load reviews", err);
    return [];
  }
}

export default async function PerformanceReviewsPage({
  searchParams,
  orgSlug,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
  orgSlug?: string;
}) {
 const inferredOrgSlug =
  orgSlug ?? ((globalThis as any).__INTIME_ORG_SLUG__ as string | undefined);
const base = inferredOrgSlug ? `/org/${inferredOrgSlug}` : "";
  const reviews = await getReviews();

  const employeeIdFilter =
    typeof searchParams?.employeeId === "string"
      ? searchParams.employeeId
      : undefined;

  const filtered = employeeIdFilter
    ? reviews.filter((r) => r.employee?.id === employeeIdFilter)
    : reviews;

  const firstEmployee = filtered[0]?.employee;

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Performance / Reviews</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Performance reviews
            </h1>

            {employeeIdFilter && firstEmployee && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700">
                  Filtered to {getEmployeeName(firstEmployee)}
                </span>
                <Link
                  href={`${base}/performance/reviews`}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Clear filter
                </Link>
              </div>
            )}
          </div>

          <Link
            href={`${base}/performance/reviews/new`}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + New review
          </Link>
        </header>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
            <p className="font-medium">
              {employeeIdFilter
                ? "No reviews for this employee yet."
                : "No performance reviews yet."}
            </p>
            <div className="mt-4">
              <Link
                href={
                  employeeIdFilter
                    ? `${base}/performance/reviews/new?employeeId=${encodeURIComponent(
                        employeeIdFilter
                      )}`
                    : `${base}/performance/reviews/new`
                }
                className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white"
              >
                + Add first review
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {r.employee ? (
                        <Link
                          href={`${base}/people/${r.employee.id}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {getEmployeeName(r.employee)}
                        </Link>
                      ) : (
                        "Employee"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.period || "—"}</td>
                    <td className="px-4 py-3 text-sm">{ratingBadge(r.rating)}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`${base}/performance/reviews/${r.id}`}
                          className="rounded-md border px-2 py-1 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <Link
                          href={`${base}/performance/reviews/${r.id}/form?role=self`}
                          className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-700"
                        >
                          Self
                        </Link>
                        <Link
                          href={`${base}/performance/reviews/${r.id}/form?role=manager`}
                          className="rounded-md border px-2 py-1 hover:bg-slate-50"
                        >
                          Manager
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AuthGate>
  );
}
