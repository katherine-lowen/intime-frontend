import EmployeeHomeClient from "./EmployeeHomeClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <EmployeeHomeClient orgSlug={orgSlug} />;
}
