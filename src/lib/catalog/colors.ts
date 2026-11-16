/**
 * Familles de couleurs pour le filtre à pastilles.
 * Les couleurs produit sont du texte libre (« Rouge brique », « Bleu ciel ») :
 * on les rattache à une famille par mots-clés. Les teintes ci-dessous sont des
 * données d'affichage des pastilles, pas des couleurs de la charte.
 */
export const COLOR_FAMILIES = [
  { name: "Noir", swatch: "#1f1f1f", keywords: ["noir", "black", "anthracite", "charbon"] },
  { name: "Blanc", swatch: "#fbfaf7", keywords: ["blanc", "white", "ivoire", "écru", "ecru", "crème", "creme"] },
  { name: "Gris", swatch: "#9a9a9a", keywords: ["gris", "grey", "gray", "argent"] },
  { name: "Beige", swatch: "#d8c3a5", keywords: ["beige", "sable", "camel", "taupe", "nude"] },
  { name: "Marron", swatch: "#7a4a2a", keywords: ["marron", "brun", "chocolat", "cognac", "caramel", "tabac"] },
  { name: "Rouge", swatch: "#b3261e", keywords: ["rouge", "bordeaux", "brique", "carmin", "red", "cerise"] },
  { name: "Rose", swatch: "#e8a0b4", keywords: ["rose", "fuchsia", "framboise", "pink", "corail"] },
  { name: "Orange", swatch: "#e07b2e", keywords: ["orange", "cuivr", "rouille", "abricot", "terracotta"] },
  { name: "Jaune", swatch: "#e9c43b", keywords: ["jaune", "moutarde", "ocre", "yellow", "doré", "dore"] },
  { name: "Vert", swatch: "#3f7d4e", keywords: ["vert", "kaki", "émeraude", "emeraude", "olive", "sauge", "green"] },
  { name: "Bleu", swatch: "#2f5e9e", keywords: ["bleu", "marine", "navy", "denim", "indigo", "turquoise", "blue", "ciel"] },
  { name: "Violet", swatch: "#6e4a8e", keywords: ["violet", "mauve", "lilas", "prune", "lavande", "purple"] },
  { name: "Multicolore", swatch: "conic-gradient(#b3261e, #e9c43b, #3f7d4e, #2f5e9e, #b3261e)", keywords: ["multi", "imprimé"] },
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number]["name"];

const norm = (s: string) => s.toLocaleLowerCase("fr");

/** Famille d'une couleur produit (première correspondance dans l'ordre de la liste). */
export function colorFamilyOf(color: string | null | undefined): ColorFamily | null {
  if (!color) return null;
  const c = norm(color);
  return COLOR_FAMILIES.find((f) => f.keywords.some((k) => c.includes(k)))?.name ?? null;
}

export function colorFamily(name: string) {
  return COLOR_FAMILIES.find((f) => f.name === name) ?? null;
}
