import "server-only";

import Stripe from "stripe";
import { serverEnv } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) stripe = new Stripe(serverEnv.stripeSecretKey);
  return stripe;
}

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
