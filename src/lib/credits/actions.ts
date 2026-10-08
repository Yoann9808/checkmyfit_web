"use server";

import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/env";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { safeInternalPath } from "@/lib/utils";
import { findPack } from "./packs";

/** Crée une session Stripe Checkout pour un pack et y redirige. */
export async function createCheckoutSessionAction(formData: FormData) {
  const session = await requireSessionUser("/credits");
  const pack = findPack(String(formData.get("packId") ?? ""));
  const next = safeInternalPath(formData.get("next"), "/essayage");
  if (!pack) redirect("/credits?erreur=pack");
  if (!isStripeConfigured) redirect("/credits?erreur=stripe");

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.email ?? undefined,
    client_reference_id: session.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: pack.priceCents,
          product_data: {
            name: `${pack.credits} crédits IA Checkmyfit`,
            description: "Achat unique, crédités immédiatement. 1 crédit = 1 essayage virtuel.",
          },
        },
      },
    ],
    metadata: { user_id: session.id, pack_id: pack.id, credits: String(pack.credits) },
    success_url: `${publicEnv.siteUrl}/credits/confirmation?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(next)}`,
    cancel_url: `${publicEnv.siteUrl}/credits?annule=1&next=${encodeURIComponent(next)}`,
    locale: "fr",
  });

  if (!checkout.url) redirect("/credits?erreur=stripe");
  redirect(checkout.url);
}
