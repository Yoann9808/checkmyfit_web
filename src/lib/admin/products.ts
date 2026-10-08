import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import type { ProductInput } from "@/lib/catalog/schema";
import type { TablesInsert } from "@/lib/supabase/database.types";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Télécharge l'image depuis son URL et la stocke dans le bucket public `products`. */
export async function storeProductImage(admin: Admin, externalId: string, url: string): Promise<string> {
  const res = await fetch(url, { headers: { Accept: "image/*" }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`image inaccessible (${res.status})`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXT_BY_TYPE[type];
  if (!ext) throw new Error(`format d'image non supporté (${type || "inconnu"})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_IMAGE_BYTES) throw new Error("image trop lourde (10 Mo max)");

  const path = `${slugify(externalId)}-${Date.now()}.${ext}`;
  const { error } = await admin.storage.from("products").upload(path, buffer, { contentType: type, upsert: true });
  if (error) throw new Error(`stockage impossible : ${error.message}`);
  return path;
}

async function uniqueSlug(admin: Admin, base: string, externalId: string): Promise<string> {
  const { data } = await admin.from("products").select("id, external_id").eq("slug", base).maybeSingle();
  if (!data || data.external_id === externalId) return base;
  return `${base}-${slugify(externalId)}`;
}

/**
 * Crée ou met à jour un produit (clé : external_id).
 * L'image n'est retéléchargée que si l'URL source a changé.
 */
export async function upsertProduct(admin: Admin, input: ProductInput): Promise<{ id: string; slug: string }> {
  const { data: existing } = await admin
    .from("products")
    .select("id, slug, image_path, image_source_url")
    .eq("external_id", input.external_id)
    .maybeSingle();

  let image_path = existing?.image_path ?? null;
  let image_source_url = existing?.image_source_url ?? null;
  if (input.image_url && input.image_url !== existing?.image_source_url) {
    image_path = await storeProductImage(admin, input.external_id, input.image_url);
    image_source_url = input.image_url;
    if (existing?.image_path && !existing.image_path.startsWith("/") && !existing.image_path.startsWith("http")) {
      await admin.storage.from("products").remove([existing.image_path]);
    }
  }

  const slug = existing?.slug ?? (await uniqueSlug(admin, slugify(`${input.brand} ${input.name}`), input.external_id));

  const row: TablesInsert<"products"> = {
    external_id: input.external_id,
    slug,
    name: input.name,
    brand: input.brand,
    category: input.category,
    gender: input.gender,
    price: input.price,
    currency: input.currency,
    color: input.color,
    description: input.description,
    care: input.care,
    made_in: input.made_in,
    size_advice: input.size_advice,
    sizes: input.sizes,
    image_path,
    image_source_url,
    merchant: input.merchant,
    affiliate_url: input.affiliate_url,
    is_popular: input.is_popular,
    is_new: input.is_new,
    is_active: input.is_active,
  };

  const { data, error } = await admin
    .from("products")
    .upsert(row, { onConflict: "external_id" })
    .select("id, slug")
    .single();
  if (error) throw new Error(error.message);
  return data;
}
