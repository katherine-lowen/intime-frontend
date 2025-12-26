"use client";

export default function CertificateView({ viewUrl }: { viewUrl: string }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
        <div className="text-sm font-semibold text-slate-800">Certificate</div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => window.print()}
          >
            Print
          </button>
          <a
            href={viewUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Open in new tab
          </a>
        </div>
      </div>
      <iframe src={viewUrl} className="h-full w-full border-0" title="Certificate" />
    </div>
  );
}
