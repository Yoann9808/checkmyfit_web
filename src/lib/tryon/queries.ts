import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { Tables } from "@/lib/supabase/database.types";

export type TryOn = Tables<"tryons">;

/** Identifiants des produits déjà générés avec succès pour l'utilisateur courant. */
export const getUserTryOnIds = cache(async (): Promise<Set<string>> => {
  const session = await getSessionUser();
  if (!session) return new Set();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tryons")
    .select("product_id")
    .eq("user_id", session.id)
    .eq("status", "succeeded");
  return new Set((data ?? []).map((r) => r.product_id));
});

/** Essayage de l'utilisateur courant pour un produit donné. */
export const getUserTryOnForProduct = cache(async (productId: string): Promise<TryOn | null> => {
  const session = await getSessionUser();
  if (!session) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tryons")
    .select("*")
    .eq("user_id", session.id)
    .eq("product_id", productId)
    .maybeSingle();
  return data ?? null;
});

export const getUserTryOnById = cache(async (id: string): Promise<TryOn | null> => {
  const session = await getSessionUser();
  if (!session) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("tryons").select("*").eq("id", id).maybeSingle();
  return data ?? null;
});

/** Historique complet des essayages de l'utilisateur courant, produit inclus. */
export const listUserTryOns = cache(async () => {
  const session = await getSessionUser();
  if (!session) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("tryons")
    .select("*, product:products(*)")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });
  return data ?? [];
});
