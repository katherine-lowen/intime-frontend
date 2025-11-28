// src/lib/supabase-server.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!rawUrl || !rawAnon) {
  throw new Error(
    "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// After this point, TS knows they are strings — no more undefined.
const SUPABASE_URL: string = rawUrl;
const SUPABASE_ANON_KEY: string = rawAnon;

// Singleton so we don't re-create the client repeatedly
let client: SupabaseClient | null = null;

export function createSupabaseServerClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

// For older imports that expect "supabaseServer"
export const supabaseServer = createSupabaseServerClient();
