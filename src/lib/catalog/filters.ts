/**
 * Filtres du catalogue : clés d'URL (en français, partageables) et lecture.
 * Module partagé entre le serveur (requête) et la barre de filtres (client).
 */

export const FILTER_PARAMS = {
  gender: "genre",
  pieceType: "type",
  category: "categorie",
  priceMin: "prix_min",
  priceMax: "prix_max",
  brand: "marque",
  size: "taille",
  color: "couleur",
  material: "matiere",
  pattern: "motif",
  promo: "promo",
} as const;

export type FilterKey = keyof typeof FILTER_PARAMS;

export const PROMOS = { solde: "En solde", nouveautes: "Nouveautés" } as const;
export type Promo = keyof typeof PROMOS;

export type CatalogFilters = {
  gender?: string;
  pieceType?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  brand?: string;
  size?: string;
  /** Famille de couleur (cf. `colors.ts`). */
  color?: string;
  material?: string;
  pattern?: string;
  promo?: Promo;
  q?: string;
};

/** Valeurs disponibles pour chaque filtre, issues des fiches produits. */
export type Facets = {
  genders: string[];
  pieceTypes: string[];
  categories: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
  materials: string[];
  patterns: string[];
  price: { min: number; max: number };
  promos: { solde: boolean; nouveautes: boolean };
};

const ALL = "Toutes";

/** Lit les filtres depuis les paramètres d'URL. */
export function parseFilters(params: Record<string, string | string[] | undefined>): CatalogFilters {
  const one = (k: string) => {
    const v = params[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s !== ALL ? s.trim() || undefined : undefined;
  };
  const num = (k: string) => {
    const n = Number(one(k));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const promo = one(FILTER_PARAMS.promo);

  return {
    gender: one(FILTER_PARAMS.gender),
    pieceType: one(FILTER_PARAMS.pieceType),
    category: one(FILTER_PARAMS.category),
    priceMin: num(FILTER_PARAMS.priceMin),
    // `prix` : ancien paramètre (prix max seul), gardé pour les liens existants
    priceMax: num(FILTER_PARAMS.priceMax) ?? num("prix"),
    brand: one(FILTER_PARAMS.brand),
    size: one(FILTER_PARAMS.size),
    color: one(FILTER_PARAMS.color),
    material: one(FILTER_PARAMS.material),
    pattern: one(FILTER_PARAMS.pattern),
    promo: promo && promo in PROMOS ? (promo as Promo) : undefined,
    q: one("q"),
  };
}
