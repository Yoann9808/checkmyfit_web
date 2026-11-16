import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { Product } from "@/lib/catalog/queries";

/** Identifiants des produits sauvegardés par l'utilisateur courant. */
export const getSavedProductIds = cache(async (): Promise<Set<string>> => {
  const session = await getSessionUser();
  if (!session) return new Set();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("saved_products").select("product_id").eq("user_id", session.id);
  return new Set((data ?? []).map((r) => r.product_id));
});

/** Produits sauvegardés (actifs), du plus récent au plus ancien. */
export const listSavedProducts = cache(async (): Promise<Product[]> => {
  const session = await getSessionUser();
  if (!session) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("saved_products")
    .select("product:products(*)")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => r.product).filter((p): p is Product => Boolean(p?.is_active));
});
