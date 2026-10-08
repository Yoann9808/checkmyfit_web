import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Client Supabase avec la clé service role : contourne la RLS.
 * À n'utiliser que côté serveur, pour les opérations système
 * (pipeline IA, webhook Stripe, import catalogue).
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
