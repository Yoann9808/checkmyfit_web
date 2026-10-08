"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Client Supabase côté navigateur (singleton). */
export function createSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseKey);
  }
  return client;
}
