"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

export type ToggleSavedResult = { ok: true; saved: boolean } | { ok: false; reason: "not_authenticated" | "error" };

/** Ajoute ou retire un produit des pièces sauvegardées. */
export async function setProductSavedAction(productId: string, saved: boolean): Promise<ToggleSavedResult> {
  const session = await getSessionUser();
  if (!session) return { ok: false, reason: "not_authenticated" };
  const id = z.string().uuid().safeParse(productId);
  if (!id.success) return { ok: false, reason: "error" };

  const supabase = await createSupabaseServerClient();
  const { error } = saved
    ? await supabase
        .from("saved_products")
        .upsert({ user_id: session.id, product_id: id.data }, { onConflict: "user_id,product_id", ignoreDuplicates: true })
    : await supabase.from("saved_products").delete().eq("user_id", session.id).eq("product_id", id.data);
  if (error) {
    console.error("setProductSaved :", error);
    return { ok: false, reason: "error" };
  }

  revalidatePath("/essayage");
  return { ok: true, saved };
}
