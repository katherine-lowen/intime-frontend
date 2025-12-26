"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { listMyCertificates, certificateViewUrl } from "@/lib/learning-api";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";

type Certificate = {
  id: string;
  courseTitle?: string | null;
  issuedAt?: string | null;
  courseVersion?: string | number | null;
};

export default function CertificatesClient({ orgSlug }: { orgSlug: string }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [shareCertId, setShareCertId] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState(30);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showScaleModal, setShowScaleModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listMyCertificates(orgSlug);
        if (!cancelled) setCertificates(res || []);
      } catch (err: any) {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setError("Certificates not enabled yet.");
          } else {
            setError(err?.message || "Unable to load certificates");
            setRequestId(err?.requestId || err?.response?.data?._requestId || null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  return (
    <div className="space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Certificates</p>
        <h1 className="text-2xl font-semibold text-slate-900">Your certificates</h1>
      </div>

      {error ? (
        <SupportErrorCard title="Certificates" message={error} requestId={requestId} />
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No certificates yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Course</th>
                <th className="px-3 py-2">Issued</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-sm text-slate-800">
                    {cert.courseTitle || "Course"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {cert.issuedAt || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {cert.courseVersion ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600 space-x-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/org/${orgSlug}/learning/certificates/${cert.id}`}>
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShareCertId(cert.id);
                        setShareUrl(null);
                      }}
                    >
                      Share
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shareCertId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Share certificate</h3>
                <p className="text-sm text-slate-600">Generate a public link with expiry.</p>
              </div>
              <button
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setShareCertId(null)}
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-medium">Expiry</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </label>
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      const url = await certificateViewUrl(orgSlug, shareCertId, { expiryDays });
                      setShareUrl(url);
                    } catch (err: any) {
                      if (err?.response?.status === 403) {
                        setShowScaleModal(true);
                      } else {
                        alert(err?.message || "Unable to generate link");
                      }
                    }
                  }}
                >
                  Generate link
                </Button>
                {shareUrl ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard?.writeText(shareUrl || "");
                    }}
                  >
                    Copy link
                  </Button>
                ) : null}
              </div>
              {shareUrl ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  {shareUrl}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <UpgradeToScaleModal open={showScaleModal} onClose={() => setShowScaleModal(false)} orgSlug={orgSlug} />
    </div>
  );
}
