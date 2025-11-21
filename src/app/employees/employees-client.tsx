"use client";

type Employee = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";
  startDate?: string | null;
};

export default function EmployeesClient({
  initialEmployees,
}: {
  initialEmployees: Employee[] | undefined | null;
}) {
  const employees = Array.isArray(initialEmployees) ? initialEmployees : [];

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Employees</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
        Rendering live data from your backend <code>/employees</code> endpoint.
      </p>

      {employees.length === 0 ? (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 14, color: "#6b7280" }}>
            No employees yet. Create one via your API and refresh this page.
          </div>
          <pre
            style={{
              textAlign: "left",
              marginTop: 12,
              padding: 12,
              background: "#f9fafb",
              borderRadius: 8,
              overflowX: "auto",
              fontSize: 12,
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >{`curl -sS -X POST http://localhost:3333/employees \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId":"demo-org",
    "firstName":"Alex",
    "lastName":"Rivera",
    "email":"alex@company.com",
    "title":"Senior Software Engineer",
    "department":"Engineering",
    "location":"NYC",
    "status":"ACTIVE",
    "startDate":"2023-04-10"
  }' | jq`}</pre>
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Title</Th>
                <Th>Department</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th>Start</Th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const name = [e.firstName ?? "", e.lastName ?? ""].join(" ").trim() || e.email || "—";
                return (
                  <tr key={e.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <Td>{name}</Td>
                    <Td>{e.email ?? "—"}</Td>
                    <Td>{e.title ?? "—"}</Td>
                    <Td>{e.department ?? "—"}</Td>
                    <Td>{e.location ?? "—"}</Td>
                    <Td>{e.status ?? "—"}</Td>
                    <Td>{formatDate(e.startDate)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{children}</td>;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
