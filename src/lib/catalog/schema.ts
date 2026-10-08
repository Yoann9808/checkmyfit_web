import { z } from "zod";
import { CATEGORIES, GENDERS } from "./taxonomy";

const trimmed = z.string().trim();
const optionalText = trimmed.optional().transform((v) => (v ? v : null));

const boolish = z
  .union([z.boolean(), z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    if (!v) return false;
    return ["1", "true", "oui", "yes", "vrai", "x"].includes(v.trim().toLowerCase());
  });

const price = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === "number" ? v : Number(String(v).replace(",", ".").replace(/[^\d.]/g, ""))))
  .pipe(z.number().min(0, "Prix invalide"));

const sizes = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((v) => {
    if (!v) return [] as string[];
    const arr = Array.isArray(v) ? v : v.split(/[|,;]/);
    return arr.map((s) => s.trim()).filter(Boolean);
  });

const url = trimmed.url("URL invalide");

/** Schéma d'un produit tel qu'il arrive du CSV ou du formulaire admin. */
export const productInputSchema = z.object({
  external_id: trimmed.min(1, "Identifiant externe requis"),
  name: trimmed.min(1, "Nom requis"),
  brand: trimmed.min(1, "Marque requise"),
  category: z.enum(CATEGORIES, { message: "Catégorie inconnue" }),
  gender: z.enum(GENDERS).default("Unisexe"),
  price,
  currency: trimmed.default("EUR"),
  color: optionalText,
  description: optionalText,
  care: optionalText,
  made_in: optionalText,
  size_advice: optionalText,
  sizes,
  image_url: url.optional().or(z.literal("").transform(() => undefined)),
  merchant: trimmed.min(1, "Marchand requis"),
  affiliate_url: url,
  is_popular: boolish,
  is_new: boolish,
  is_active: boolish.transform((v) => v ?? true),
});

export type ProductInput = z.infer<typeof productInputSchema>;

/** Colonnes attendues dans le CSV, dans l'ordre du template. */
export const CSV_COLUMNS = [
  "external_id",
  "name",
  "brand",
  "category",
  "gender",
  "price",
  "currency",
  "color",
  "description",
  "care",
  "made_in",
  "size_advice",
  "sizes",
  "image_url",
  "merchant",
  "affiliate_url",
  "is_popular",
  "is_new",
  "is_active",
] as const;

export const CSV_TEMPLATE = [
  CSV_COLUMNS.join(","),
  [
    "SKU-001",
    "Sweat à Capuche Molleton",
    "Maison Aune",
    "Sweat-shirt",
    "Homme",
    "89",
    "EUR",
    "Rouge brique",
    "\"Un sweat à capuche en molleton épais, capuche doublée, poche kangourou.\"",
    "Lavage machine à 30°C",
    "Fabriqué au Portugal",
    "Coupe oversize : prenez votre taille habituelle.",
    "XS|S|M|L|XL",
    "https://exemple.com/images/sweat.jpg",
    "Maison Aune",
    "https://exemple.com/p/sweat?aff=checkmyfit",
    "true",
    "true",
    "true",
  ].join(","),
].join("\n");
