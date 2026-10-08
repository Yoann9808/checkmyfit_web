import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export type SessionUser = {
  id: string;
  email: string | null;
  profile: Tables<"profiles">;
};

/**
 * Utilisateur connecté + profil, ou null.
 * Mis en cache par requête (React cache) : appelable depuis le header et la page.
 * Tolère l'absence de configuration Supabase (retourne null).
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { id: user.id, email: user.email ?? null, profile };
});

/** Redirige vers la connexion si non connecté, en mémorisant la page cible. */
export async function requireSessionUser(nextPath?: string): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    const params = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/connexion${params}`);
  }
  return session;
}

/** Réservé aux administrateurs. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSessionUser("/admin");
  if (session.profile.role !== "admin") redirect("/");
  return session;
}
