import CertificatesClient from "./CertificatesClient";

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <CertificatesClient orgSlug={orgSlug} />;
}
