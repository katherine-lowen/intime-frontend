import ReportsClient from "./ReportsClient";

export default async function PayrollReportsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <ReportsClient orgSlug={orgSlug} />;
}
