/** Concatène des classes en ignorant les valeurs falsy. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Formate un prix en euros à la française (89 → "89 €", 12.99 → "12,99 €"). */
export function formatPrice(value: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Pluriel simple : plural(1, "crédit") → "1 crédit", plural(3, "crédit") → "3 crédits". */
export function plural(count: number, singular: string, pluralForm?: string) {
  const word = count > 1 ? (pluralForm ?? `${singular}s`) : singular;
  return `${count} ${word}`;
}

/**
 * Chemin de retour sûr : interne uniquement (`/…`), jamais `//hôte` ni `/\hôte`
 * que les navigateurs interprètent comme une URL externe.
 */
export function safeInternalPath(next: unknown, fallback = "/"): string {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}

/** Slug URL à partir d'un libellé (accents retirés). */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
