// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  // For now, just let all requests through.
  return NextResponse.next();
}

// No protected routes yet; we'll add matchers later.
export const config = {
  matcher: [],
};
