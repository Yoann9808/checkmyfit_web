import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PackPicker } from "@/components/credits/pack-picker";
import { requireSessionUser } from "@/lib/auth/session";
import { isStripeConfigured } from "@/lib/stripe/client";
import { plural, safeInternalPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Crédits IA" };

const MESSAGES: Record<string, string> = {
  epuise: "Vos crédits IA sont épuisés. Rechargez pour continuer vos essayages.",
  annule: "Paiement annulé. Vos crédits n'ont pas changé.",
  pack: "Pack inconnu. Choisissez une formule ci-dessous.",
  stripe: "Le paiement est momentanément indisponible. Réessayez plus tard.",
};

export default async function CreditsPage({ searchParams }: PageProps<"/credits">) {
  const params = await searchParams;
  const next = safeInternalPath(params.next, "/essayage");
  const session = await requireSessionUser(`/credits?next=${encodeURIComponent(next)}`);
  const credits = session.profile.credits_balance;

  const key = typeof params.raison === "string" ? params.raison : params.annule ? "annule" : typeof params.erreur === "string" ? params.erreur : null;
  const message = key ? MESSAGES[key] : null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:px-5 sm:py-10">
      <Link href={next} className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-wide text-wenge hover:text-palissandre">
        <ArrowLeft size={15} aria-hidden /> Retour
      </Link>
      <h1 className="mb-1 font-display text-3xl text-palissandre sm:text-4xl">Recharger mes crédits IA</h1>
      <p className="mb-6 font-body text-sm text-wenge">
        Solde actuel : <span className="text-terracotta">{plural(credits, "crédit")}</span>. Chaque essayage virtuel
        consomme 1 crédit, remboursé en cas d&apos;échec.
      </p>
      {message && (
        <p className={`mb-6 rounded-xl px-4 py-3 font-body text-xs ${key === "epuise" || key === "annule" ? "bg-chene-pale text-palissandre" : "bg-brique/10 text-brique"}`}>
          {message}
        </p>
      )}
      <PackPicker next={next} stripeReady={isStripeConfigured} />
      <p className="mt-6 font-body text-[11px] text-noyer">
        Paiement sécurisé par Stripe. Aucune donnée bancaire n&apos;est stockée par Checkmyfit.
      </p>
    </section>
  );
}
