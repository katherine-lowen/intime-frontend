export type ParsedApiError = {
  message: string;
};

export function parseApiError(error: unknown): ParsedApiError {
  try {
    const maybeResponse = (error as any)?.response;
    const data = maybeResponse?.data;
    if (data && typeof data === "object") {
      const msg = (data as any)?.message;
      if (typeof msg === "string" && msg.length > 0) {
        return { message: msg };
      }
    }

    const directMessage = (error as any)?.message;
    if (typeof directMessage === "string" && directMessage.length > 0) {
      return { message: directMessage };
    }
  } catch {
    // fall through to generic
  }

  return { message: "Something went wrong. Please try again." };
}
