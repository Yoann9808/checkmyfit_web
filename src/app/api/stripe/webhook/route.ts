import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { serverEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fulfillCheckoutSession } from "@/lib/credits/fulfill";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, serverEnv.stripeWebhookSecret);
  } catch (err) {
    console.error("Webhook Stripe : signature invalide", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error: dupError } = await admin.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dupError?.code === "23505") return NextResponse.json({ received: true, duplicate: true });

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await fulfillCheckoutSession(event.data.object);
    }
  } catch (err) {
    console.error("Webhook Stripe : traitement échoué", err);
    // On retire l'événement pour que Stripe le renvoie
    await admin.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
