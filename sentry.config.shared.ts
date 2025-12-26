import * as Sentry from "@sentry/nextjs";

export const resolveSentryDsn = () =>
  process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";

export const isSentryEnabled = () => Boolean(resolveSentryDsn());

function safeGetPathname(event: any): string | null {
  const url =
    event?.request?.url ||
    event?.contexts?.request?.url ||
    event?.contexts?.trace?.data?.url ||
    null;
  if (!url || typeof url !== "string") return null;
  try {
    if (url.startsWith("http")) return new URL(url).pathname;
    return url.startsWith("/") ? url : null;
  } catch {
    return null;
  }
}

export const getSentryInitConfig = (): Parameters<typeof Sentry.init>[0] => ({
  dsn: resolveSentryDsn(),
  enabled: isSentryEnabled(),
  beforeSend(event) {
    if (!isSentryEnabled()) return null;
    const pathname = safeGetPathname(event);
    if (pathname) event.tags = { ...(event.tags || {}), pathname };
    return event;
  },
});

// keep export if anything imports it, but it must not do anything
export const applySentryTags = () => {};
