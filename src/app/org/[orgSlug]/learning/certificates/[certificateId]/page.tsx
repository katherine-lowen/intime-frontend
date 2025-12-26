import { redirect } from "next/navigation";
import CertificateView from "./view";
import { certificateViewUrl } from "@/lib/learning-api";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ orgSlug: string; certificateId: string }>;
}) {
  const { orgSlug, certificateId } = await params;

  try {
    const url = await certificateViewUrl(orgSlug, certificateId);
    if (url) {
      // Render view page with iframe to allow print/download
      return <CertificateView viewUrl={url} />;
    }
  } catch (err: any) {
    // fall through to simple message
  }

  // fallback: redirect to learning home
  redirect(`/org/${orgSlug}/learning`);
}
