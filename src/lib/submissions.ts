export async function logSubmission({
  action,
  payload,
  status = "ATTEMPTED",
  error = null,
  orgId,
  userId,
}: {
  action: string;
  payload?: unknown;
  status?: "ATTEMPTED" | "SUCCESS" | "FAILED";
  error?: string | null;
  orgId?: string;
  userId?: string;
}) {
  await fetch("/api/log-submission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      payload,
      status,
      error,
      orgId,
      userId,
    }),
  });
}
