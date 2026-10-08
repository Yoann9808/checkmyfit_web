"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { processTryOn } from "./process";

export type StartTryOnResult =
  | { ok: true; tryonId: string; status: string }
  | { ok: false; reason: "not_authenticated" | "no_photo" | "insufficient_credits" | "product_not_found" | "error"; message: string };

/**
 * Lance un essayage : débit atomique du crédit via `start_tryon`,
 * puis génération en tâche de fond après la réponse.
 */
export async function startTryOn(productId: string): Promise<StartTryOnResult> {
  const session = await getSessionUser();
  if (!session) return { ok: false, reason: "not_authenticated", message: "Connectez-vous pour essayer." };
  if (!session.profile.reference_photo_path)
    return { ok: false, reason: "no_photo", message: "Ajoutez d'abord votre photo de référence." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("start_tryon", { p_product_id: productId });

  if (error) {
    if (error.message.includes("INSUFFICIENT_CREDITS"))
      return { ok: false, reason: "insufficient_credits", message: "Vous n'avez plus de crédit IA." };
    if (error.message.includes("PRODUCT_NOT_FOUND"))
      return { ok: false, reason: "product_not_found", message: "Ce produit n'est plus disponible." };
    console.error("start_tryon :", error);
    return { ok: false, reason: "error", message: "Impossible de lancer l'essayage. Réessayez." };
  }

  if (data.status === "queued") {
    after(() => processTryOn(data.id));
  }

  return { ok: true, tryonId: data.id, status: data.status };
}

/** Variante formulaire : redirige vers l'écran adapté. */
export async function startTryOnAndRedirect(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const productSlug = String(formData.get("productSlug") ?? "");
  const result = await startTryOn(productId);

  if (!result.ok) {
    const back = productSlug ? `/produit/${productSlug}` : "/catalogue";
    if (result.reason === "not_authenticated") redirect(`/connexion?next=${encodeURIComponent(back)}`);
    if (result.reason === "no_photo") redirect(`/onboarding/photo?next=${encodeURIComponent(back)}`);
    if (result.reason === "insufficient_credits") redirect(`/credits?raison=epuise&next=${encodeURIComponent(back)}`);
    redirect(`${back}?erreur=${encodeURIComponent(result.message)}`);
  }

  if (result.status === "succeeded") redirect(`/essayage/resultat/${result.tryonId}`);
  redirect(`/essayage/generation/${result.tryonId}`);
}
