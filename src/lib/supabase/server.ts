import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Client Supabase côté serveur (Server Components, Server Actions, Route Handlers),
 * authentifié avec la session de l'utilisateur via les cookies.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Appelé depuis un Server Component : les cookies sont rafraîchis par le proxy.
        }
      },
    },
  });
}
