// src/components/IdentitySync.tsx
"use client";

import { useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

/**
 * Create a singleton Supabase client for client-side use.
 */
function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("[IdentitySync] Missing Supabase env vars");
    return null;
  }

  supabase = createClient(url, anonKey);
  return supabase;
}

export function IdentitySync() {
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return; // ❗ TS-safe early return

    let mounted = true;

    async function syncFromCurrentUser() {
      if (!client) return; // extra safety
      const { data, error } = await client.auth.getUser();
      if (!mounted || error || !data?.user) return;

      const user = data.user;
      const email = user.email ?? "";
      const name =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        "";

      if (typeof window !== "undefined") {
        if (email) window.localStorage.setItem("intime_user_email", email);
        if (name) window.localStorage.setItem("intime_user_name", name);
      }
    }

    // Initial sync
    syncFromCurrentUser();

    // Keep in sync on auth changes
    const { data: subscription } = client.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user;
        const email = user?.email ?? "";
        const name =
          (user?.user_metadata?.full_name as string | undefined) ||
          (user?.user_metadata?.name as string | undefined) ||
          "";

        if (typeof window !== "undefined") {
          if (email) window.localStorage.setItem("intime_user_email", email);
          if (name) window.localStorage.setItem("intime_user_name", name);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return null;
}
