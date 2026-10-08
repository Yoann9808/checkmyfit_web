import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { PRICE_MAX_DEFAULT } from "./taxonomy";
import type { Tables } from "@/lib/supabase/database.types";

export type Product = Tables<"products">;

export type CatalogFilters = {
  category?: string;
  brand?: string;
  color?: string;
  gender?: string;
  priceMax?: number;
  q?: string;
};

export const ALL = "Toutes";

/** Lit les filtres depuis les paramètres d'URL. */
export function parseFilters(params: Record<string, string | string[] | undefined>): CatalogFilters {
  const one = (k: string) => {
    const v = params[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s !== ALL ? s : undefined;
  };
  const priceMax = Number(one("prix"));
  return {
    category: one("categorie"),
    brand: one("marque"),
    color: one("couleur"),
    gender: one("genre"),
    priceMax: Number.isFinite(priceMax) && priceMax > 0 && priceMax < PRICE_MAX_DEFAULT ? priceMax : undefined,
    q: one("q"),
  };
}

export const listProducts = cache(async (filters: CatalogFilters = {}): Promise<Product[]> => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.color) query = query.eq("color", filters.color);
  if (filters.gender) query = query.eq("gender", filters.gender as Product["gender"]);
  if (filters.priceMax) query = query.lte("price", filters.priceMax);
  if (filters.q) query = query.or(`name.ilike.%${filters.q}%,brand.ilike.%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  return data ?? null;
});

export const getProductById = cache(async (id: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return data ?? null;
});

/** Valeurs distinctes pour les filtres (marques, couleurs). */
export const getFacets = cache(async () => {
  if (!isSupabaseConfigured) return { brands: [] as string[], colors: [] as string[] };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("brand, color").eq("is_active", true);
  const brands = Array.from(new Set((data ?? []).map((r) => r.brand))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const colors = Array.from(new Set((data ?? []).map((r) => r.color).filter(Boolean) as string[])).sort(
    (a, b) => a.localeCompare(b, "fr"),
  );
  return { brands, colors };
});

export const getHomeProducts = cache(async () => {
  if (!isSupabaseConfigured) return { newest: [] as Product[], popular: [] as Product[] };
  const supabase = await createSupabaseServerClient();
  const [newest, popular] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("is_new", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_popular", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  return { newest: newest.data ?? [], popular: popular.data ?? [] };
});
