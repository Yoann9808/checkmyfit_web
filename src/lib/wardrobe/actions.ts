"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/catalog/taxonomy";

/** Ajoute un essayage réussi à la catégorie "Futurs achats" du dressing. */
export async function saveTryOnToWardrobeAction(formData: FormData) {
  const session = await requireSessionUser("/dressing");
  const tryonId = String(formData.get("tryonId") ?? "");
  const supabase = await createSupabaseServerClient();

  const { data: tryon } = await supabase
    .from("tryons")
    .select("id, status, result_path, product:products(brand, category, color)")
    .eq("id", tryonId)
    .eq("user_id", session.id)
    .maybeSingle();
  if (!tryon || tryon.status !== "succeeded") redirect("/dressing");

  const { error } = await supabase.from("wardrobe_items").insert({
    user_id: session.id,
    kind: "tryon",
    tryon_id: tryon.id,
    product_id: null,
    brand: tryon.product?.brand ?? null,
    category: tryon.product?.category ?? "Autre",
    color: tryon.product?.color ?? null,
    photo_path: tryon.result_path,
  });
  // Conflit = déjà sauvegardé : on considère l'action réussie
  if (error && !error.message.includes("duplicate")) {
    console.error("saveTryOn :", error);
  }

  revalidatePath("/dressing");
  redirect(`/dressing/sauvegarde?tryon=${tryon.id}`);
}

const ownedSchema = z.object({
  path: z.string().min(1),
  brand: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORIES),
  color: z.string().trim().max(60).optional(),
});

/** Ajoute un vêtement que l'utilisateur possède (photo déjà uploadée dans `wardrobe/<uid>/…`). */
export async function addOwnedItemAction(formData: FormData) {
  const session = await requireSessionUser("/dressing");
  const parsed = ownedSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/dressing?erreur=formulaire");
  const { path, brand, category, color } = parsed.data;
  if (!path.startsWith(`${session.id}/`)) redirect("/dressing?erreur=photo");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("wardrobe_items").insert({
    user_id: session.id,
    kind: "owned",
    category,
    brand: brand || null,
    color: color || null,
    photo_path: path,
  });
  if (error) {
    console.error("addOwnedItem :", error);
    redirect("/dressing?erreur=enregistrement");
  }
  revalidatePath("/dressing");
  redirect(`/dressing?onglet=${encodeURIComponent(category)}`);
}

export async function deleteWardrobeItemAction(formData: FormData) {
  const session = await requireSessionUser("/dressing");
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();

  const { data: item } = await supabase
    .from("wardrobe_items")
    .select("id, kind, photo_path")
    .eq("id", id)
    .eq("user_id", session.id)
    .maybeSingle();
  if (!item) redirect("/dressing");

  await supabase.from("wardrobe_items").delete().eq("id", item.id);
  if (item.kind === "owned" && item.photo_path) {
    await supabase.storage.from("wardrobe").remove([item.photo_path]);
  }
  revalidatePath("/dressing");
  redirect("/dressing");
}
