import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { requireSessionUser } from "@/lib/auth/session";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { fulfillCheckoutSession } from "@/lib/credits/fulfill";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { plural, safeInternalPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Crédits ajoutés" };

export default async function CreditsConfirmationPage({ searchParams }: PageProps<"/credits/confirmation">) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : null;
  const next = safeInternalPath(params.next, "/essayage");
  const user = await requireSessionUser("/credits");
  if (!sessionId || !isStripeConfigured) redirect("/credits");

  // Identifiant de session inconnu ou falsifié : Stripe lève une erreur
  const checkout = await getStripe()
    .checkout.sessions.retrieve(sessionId)
    .catch(() => null);
  if (!checkout || checkout.metadata?.user_id !== user.id) redirect("/credits");

  // Filet de sécurité si le webhook n'est pas encore passé (idempotent)
  await fulfillCheckoutSession(checkout);

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase.from("profiles").select("credits_balance").eq("id", user.id).single();
  const added = Number(checkout.metadata?.credits ?? 0);
  const paid = checkout.payment_status === "paid";

  return (
    <section className="mx-auto max-w-md px-4 py-16 text-center sm:px-5 sm:py-20">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-palissandre">
        <Check className="h-7 w-7 text-argile" aria-hidden />
      </div>
      <h1 className="font-display text-3xl text-palissandre">{paid ? "Crédits ajoutés" : "Paiement en cours"}</h1>
      <p className="mt-2 font-body text-sm text-wenge">
        {paid ? `+${plural(added, "crédit")} IA. ` : "Vos crédits seront ajoutés dès la confirmation du paiement. "}
        Nouveau solde : {plural(profile?.credits_balance ?? user.profile.credits_balance, "crédit")}.
      </p>
      <ButtonLink href={next} className="mt-8">
        Continuer
      </ButtonLink>
    </section>
  );
}
