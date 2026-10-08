/** Packs de crédits IA (prix TTC en euros), repris de la maquette. */
export const CREDIT_PACKS = [
  { id: "pack10", credits: 10, priceCents: 499 },
  { id: "pack30", credits: 30, priceCents: 1299, popular: true, label: "Le plus choisi" },
  { id: "pack100", credits: 100, priceCents: 3499, label: "Meilleur prix au crédit" },
] as const;

export type CreditPackId = (typeof CREDIT_PACKS)[number]["id"];

export const SIGNUP_BONUS_CREDITS = 20;
export const CREDITS_PER_TRYON = 1;

export function findPack(id: string) {
  return CREDIT_PACKS.find((p) => p.id === id) ?? null;
}
