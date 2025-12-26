// src/lib/api-employees.ts
export type EmployeeSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  title: string | null;
  department: string | null;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  status?: string | null;
  startDate?: string | null;
  createdAt?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'; // adjust port to your Nest API

export async function fetchEmployeesForOrg(
  orgSlug: string
): Promise<EmployeeSummary[]> {
  const res = await fetch(`${API_BASE}/org/${orgSlug}/employees`, {
    // no-store so the table always feels fresh while you’re building
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch employees', res.status);
    return [];
  }

  const json = await res.json();
  return json.data ?? [];
}
