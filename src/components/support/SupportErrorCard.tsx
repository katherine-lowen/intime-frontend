"use client";

import { useCallback } from "react";
import { useParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  title?: string;
  message?: string;
  requestId?: string | null;
  details?: string | null;
};

export function SupportErrorCard({ title, message, requestId, details }: Props) {
  const params = useParams<{ orgSlug?: string }>();
  const pathname = usePathname();
  const orgSlug = params?.orgSlug;

  const copyDiagnostics = useCallback(async () => {
    const payload = {
      orgSlug: orgSlug || null,
      path: pathname,
      requestId: requestId || null,
      timestamp: new Date().toISOString(),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    } catch {
      // no-op
    }
  }, [orgSlug, pathname, requestId]);

  return (
    <Card className="border-rose-200 bg-rose-50">
      <CardHeader>
        <CardTitle className="text-base text-rose-900">
          {title || "Something went wrong"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-rose-900">
        <p>{message || "We hit a snag loading this data. Please try again."}</p>
        {requestId ? (
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-md bg-rose-100 px-2 py-1 text-[12px] text-rose-900">
              Request ID: {requestId}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 text-rose-900 hover:bg-rose-100"
              onClick={copyDiagnostics}
            >
              Copy diagnostic info
            </Button>
          </div>
        ) : null}
        {process.env.NODE_ENV !== "production" && details ? (
          <pre className="mt-2 overflow-auto rounded-md bg-rose-100 p-2 text-xs text-rose-900">
            {details}
          </pre>
        ) : null}
      </CardContent>
    </Card>
  );
}
