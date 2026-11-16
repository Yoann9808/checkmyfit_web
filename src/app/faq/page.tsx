import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ContentPage } from "@/components/layout/content-page";
import { CREDIT_PACKS, SIGNUP_BONUS_CREDITS } from "@/lib/credits/packs";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Questions fréquentes" };

const link = "text-terracotta underline underline-offset-2";

const FAQ: Array<{ q: string; a: ReactNode }> = [
  {
    q: "Comment fonctionne l'essayage virtuel ?",
    a: (
      <>
        Vous déposez une photo de vous, de face et en pied. Choisissez ensuite une pièce dans{" "}
        <Link href="/essayage" className={link}>Essayer</Link> : l&apos;IA génère en quelques secondes une image de vous
        la portant.
      </>
    ),
  },
  {
    q: "Le rendu est-il fidèle ?",
    a: "C'est une simulation : elle donne une bonne idée de la coupe et de l'allure, mais pas de garantie sur la taille exacte. Consultez toujours le guide des tailles du marchand.",
  },
  {
    q: "Qu'est-ce qu'un crédit IA ?",
    a: `Un crédit = un essayage. ${SIGNUP_BONUS_CREDITS} crédits sont offerts à l'inscription. Revoir un essayage déjà généré est gratuit, et un essayage qui échoue vous est recrédité automatiquement.`,
  },
  {
    q: "Combien coûtent les crédits ?",
    a: (
      <>
        Packs à partir de {(CREDIT_PACKS[0].priceCents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}{" "}
        les {CREDIT_PACKS[0].credits} crédits. Détail sur la page <Link href="/credits" className={link}>Crédits IA</Link>.
        Les crédits n&apos;expirent pas.
      </>
    ),
  },
  {
    q: "Est-ce que vous vendez les vêtements ?",
    a: "Non. Le bouton « Acheter chez… » vous emmène sur le site du marchand, qui gère la commande, la livraison et les retours. Nous touchons une commission sur certains achats, sans surcoût pour vous.",
  },
  {
    q: "Que devient ma photo ?",
    a: (
      <>
        Elle est stockée de façon privée et ne sert qu&apos;à générer vos essayages. Vous pouvez la supprimer à tout
        moment depuis <Link href="/compte" className={link}>Mon compte</Link>. Détails dans la{" "}
        <Link href="/legal/confidentialite" className={link}>politique de confidentialité</Link>.
      </>
    ),
  },
  {
    q: "Quel âge faut-il avoir ?",
    a: `${SITE.minimumAge} ans minimum. Ne déposez jamais la photo d'une autre personne ou d'un enfant.`,
  },
  {
    q: "Quelle photo donne le meilleur résultat ?",
    a: "De face, de la tête aux pieds, bien éclairée, sur un fond simple, avec des vêtements près du corps.",
  },
  {
    q: "Comment supprimer mon compte ?",
    a: (
      <>
        Depuis <Link href="/compte" className={link}>Mon compte</Link>, en bas de page. Votre photo, vos essayages et
        votre dressing sont effacés immédiatement.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <ContentPage
      title="Questions fréquentes"
      intro={
        <>
          Une question sans réponse ici ? <Link href="/contact" className={link}>Écrivez-nous</Link>.
        </>
      }
    >
      <div className="flex flex-col divide-y divide-chene-pale border-y border-chene-pale">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-palissandre">
              {q}
              <ChevronDown size={16} className="shrink-0 text-wenge transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="mt-2 font-body text-sm text-wenge">{a}</div>
          </details>
        ))}
      </div>
    </ContentPage>
  );
}
