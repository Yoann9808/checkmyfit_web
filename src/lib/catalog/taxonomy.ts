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

export const PRICE_MAX_DEFAULT = 300;
export const PRICE_MIN = 0;

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
