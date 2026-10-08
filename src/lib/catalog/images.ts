import { publicEnv } from "@/lib/env";

/**
 * URL affichable d'une image produit.
 * - `image_path` absolu (http… ou /…) : utilisé tel quel (seed, dev).
 * - sinon : objet du bucket public `products`.
 */
export function productImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  if (/^(https?:)?\/\//.test(imagePath) || imagePath.startsWith("/")) return imagePath;
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/products/${imagePath}`;
}
