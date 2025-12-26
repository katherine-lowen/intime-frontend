import ScormClient from "./ScormClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <ScormClient orgSlug={orgSlug} />;
}
