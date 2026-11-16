/** Taxonomie catalogue, reprise de la maquette. */
export const CATEGORIES = [
  "T-shirt / Débardeur",
  "Polo",
  "Sweat-shirt",
  "Maille",
  "Chemise manches longues",
  "Chemise manches courtes",
  "Veste",
  "Blazer",
  "Manteau",
  "Parka",
  "Doudoune",
  "Trench-coat",
  "Coupe-vent",
  "Pantalon",
  "Jean",
  "Short / Bermuda",
  "Jupe",
  "Jogging",
  "Robe",
  "Combinaison",
  "Accessoires",
  "Chaussures",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const GENDERS = ["Femme", "Homme", "Unisexe"] as const;
export type Gender = (typeof GENDERS)[number];


/** Familles pour les icônes de repli quand un produit n'a pas d'image. */
export type GarmentFamily = "top" | "bottom" | "shoes" | "accessory";

export function familyOf(category: string): GarmentFamily {
  if (category === "Chaussures") return "shoes";
  if (category === "Accessoires") return "accessory";
  if (["Pantalon", "Jean", "Short / Bermuda", "Jogging", "Jupe"].includes(category))
    return "bottom";
  return "top";
}

/** Tailles par défaut si le CSV n'en fournit pas. */
export function defaultSizesFor(category: string): string[] {
  if (category === "Chaussures") return ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
  if (category === "Jean") return ["34", "36", "38", "40", "42", "44"];
  if (category === "Accessoires") return ["Taille unique"];
  return ["XS", "S", "M", "L", "XL", "XXL"];
}

/** Type de pièce affiché dans les filtres, dérivé de la catégorie. */
export const PIECE_TYPES = ["Hauts", "Bas", "Robes et combinaisons", "Chaussures", "Accessoires"] as const;
export type PieceType = (typeof PIECE_TYPES)[number];

export function pieceTypeOf(category: string): PieceType {
  if (category === "Robe" || category === "Combinaison") return "Robes et combinaisons";
  const family = familyOf(category);
  if (family === "bottom") return "Bas";
  if (family === "shoes") return "Chaussures";
  if (family === "accessory") return "Accessoires";
  return "Hauts";
}

export function categoriesOfPieceType(type: string): string[] {
  return CATEGORIES.filter((c) => pieceTypeOf(c) === type);
}

export const PATTERN_SUGGESTIONS = ["Uni", "Rayé", "Carreaux", "Imprimé", "Fleuri", "Pois", "Chevrons"] as const;

const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];

/** Tri des tailles : lettres dans l'ordre XXS → 3XL, puis numériques croissantes, puis le reste. */
export function compareSizes(a: string, b: string): number {
  const rank = (s: string) => {
    const i = LETTER_SIZES.indexOf(s.toUpperCase());
    if (i >= 0) return [0, i] as const;
    const n = Number(s.replace(",", "."));
    if (Number.isFinite(n)) return [1, n] as const;
    return [2, 0] as const;
  };
  const [ga, va] = rank(a);
  const [gb, vb] = rank(b);
  return ga - gb || va - vb || a.localeCompare(b, "fr");
}
