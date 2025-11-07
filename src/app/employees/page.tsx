// src/app/employees/page.tsx
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Employee = {
  id: string;
  name: string;
  role: string;
  status: string;
};

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  let employees: Employee[] = [];
  try {
    const data = await api.get<Employee[]>("/employees");
    employees = Array.isArray(data) ? data : [];
  } catch {
    employees = [];
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <p className="mt-1 text-sm text-neutral-600">Directory of active team members.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">Role</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2">{e.name}</td>
                    <td className="px-4 py-2">{e.role}</td>
                    <td className="px-4 py-2">{e.status}</td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-sm text-neutral-500">
                      No employees yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
