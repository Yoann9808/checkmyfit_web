import "server-only";

import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Crédite un achat Stripe de façon idempotente (clé : id de la session Checkout).
 * Appelé par le webhook et, en filet de sécurité, par la page de confirmation.
 * Retourne true si les crédits ont été ajoutés par cet appel.
 */
export async function fulfillCheckoutSession(checkout: Stripe.Checkout.Session): Promise<boolean> {
  if (checkout.payment_status !== "paid") return false;
  const userId = checkout.metadata?.user_id ?? checkout.client_reference_id;
  const credits = Number(checkout.metadata?.credits ?? 0);
  if (!userId || !Number.isInteger(credits) || credits <= 0) {
    console.error("fulfill : métadonnées manquantes", checkout.id);
    return false;
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("credit_transactions").insert({
    user_id: userId,
    delta: credits,
    reason: "purchase",
    ref_id: checkout.id,
  });
  if (error) {
    // 23505 = déjà crédité
    if (error.code === "23505") return false;
    throw error;
  }
  return true;
}
