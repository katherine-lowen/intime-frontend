import DiffClient from "./DiffClient";

export default async function PayrollDiffPage({
  params,
}: {
  params: Promise<{ orgSlug: string; employeeId: string }>;
}) {
  const { orgSlug, employeeId } = await params;
  return <DiffClient orgSlug={orgSlug} employeeId={employeeId} />;
}
