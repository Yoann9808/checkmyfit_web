import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { CATEGORIES, GENDERS, PIECE_TYPES, categoriesOfPieceType, compareSizes, pieceTypeOf } from "./taxonomy";
import { COLOR_FAMILIES, colorFamilyOf } from "./colors";
import type { CatalogFilters, Facets } from "./filters";
import type { Tables } from "@/lib/supabase/database.types";

export type Product = Tables<"products">;

export { parseFilters, type CatalogFilters, type Facets } from "./filters";

export const listProducts = cache(async (filters: CatalogFilters = {}): Promise<Product[]> => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters.gender && (GENDERS as readonly string[]).includes(filters.gender))
    query = query.eq("gender", filters.gender as Product["gender"]);
  if (filters.pieceType) query = query.in("category", categoriesOfPieceType(filters.pieceType));
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.material) query = query.eq("material", filters.material);
  if (filters.pattern) query = query.eq("pattern", filters.pattern);
  if (filters.size) query = query.contains("sizes", [filters.size]);
  if (filters.priceMin) query = query.gte("price", filters.priceMin);
  if (filters.priceMax) query = query.lte("price", filters.priceMax);
  if (filters.promo === "solde") query = query.eq("is_on_sale", true);
  if (filters.promo === "nouveautes") query = query.eq("is_new", true);
  if (filters.q) query = query.or(`name.ilike.%${filters.q}%,brand.ilike.%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw error;
  const products = data ?? [];
  // Couleur : texte libre rattaché à une famille par mots-clés, filtrée ici
  return filters.color ? products.filter((p) => colorFamilyOf(p.color) === filters.color) : products;
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

const EMPTY_FACETS: Facets = {
  genders: [],
  pieceTypes: [],
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
  materials: [],
  patterns: [],
  price: { min: 0, max: 0 },
  promos: { solde: false, nouveautes: false },
};

const byFr = (a: string, b: string) => a.localeCompare(b, "fr");
const distinct = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.filter((v): v is string => Boolean(v))));
/** Garde l'ordre de référence pour les valeurs connues, puis les autres par ordre alphabétique. */
const ordered = (values: string[], reference: readonly string[]) => [
  ...reference.filter((r) => values.includes(r)),
  ...values.filter((v) => !reference.includes(v)).sort(byFr),
];

/**
 * Valeurs de filtres calculées à partir des fiches produits actives :
 * une nouvelle marque, catégorie, couleur ou matière importée apparaît
 * automatiquement dans les filtres, et une valeur sans produit disparaît.
 */
export const getFacets = cache(async (): Promise<Facets> => {
  if (!isSupabaseConfigured) return EMPTY_FACETS;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("category, brand, color, gender, price, sizes, material, pattern, is_on_sale, is_new")
    .eq("is_active", true);
  const rows = data ?? [];
  if (rows.length === 0) return EMPTY_FACETS;

  const prices = rows.map((r) => Number(r.price));
  const categories = distinct(rows.map((r) => r.category));
  return {
    genders: ordered(distinct(rows.map((r) => r.gender)), GENDERS),
    pieceTypes: ordered(distinct(categories.map(pieceTypeOf)), PIECE_TYPES),
    categories: ordered(categories, CATEGORIES),
    brands: distinct(rows.map((r) => r.brand)).sort(byFr),
    sizes: distinct(rows.flatMap((r) => r.sizes)).sort(compareSizes),
    colors: ordered(
      distinct(rows.map((r) => colorFamilyOf(r.color))),
      COLOR_FAMILIES.map((f) => f.name),
    ),
    materials: distinct(rows.map((r) => r.material)).sort(byFr),
    patterns: distinct(rows.map((r) => r.pattern)).sort(byFr),
    price: { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) },
    promos: { solde: rows.some((r) => r.is_on_sale), nouveautes: rows.some((r) => r.is_new) },
  };
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
