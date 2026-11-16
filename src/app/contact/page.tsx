import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ContentPage, ContentSection } from "@/components/layout/content-page";
import { buttonClasses } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

const link = "text-terracotta underline underline-offset-2";

export default function ContactPage() {
  return (
    <ContentPage title="Contact" intro="Une question, une marque à nous suggérer, un souci avec un essayage ? Écrivez-nous.">
      <div className="rounded-2xl bg-chene-pale p-6">
        <p className="label mb-1 text-wenge">Par e-mail</p>
        <p className="mb-4 font-display text-2xl text-palissandre">{SITE.contactEmail}</p>
        <a href={`mailto:${SITE.contactEmail}`} className={buttonClasses({ size: "sm" })}>
          <Mail size={14} aria-hidden /> Écrire un e-mail
        </a>
      </div>

      <ContentSection heading="Avant d'écrire">
        <p>
          La plupart des réponses sont dans la <Link href="/faq" className={link}>FAQ</Link>.
        </p>
      </ContentSection>
      <ContentSection heading="Vos données personnelles">
        <p>
          Pour supprimer votre photo ou votre compte, rendez-vous dans <Link href="/compte" className={link}>Mon compte</Link>.
          Pour toute autre demande liée à vos données, écrivez-nous en précisant l&apos;adresse e-mail de votre compte.
        </p>
      </ContentSection>
      <ContentSection heading="Marques et partenaires">
        <p>Vous souhaitez voir vos produits dans le catalogue ? Présentez-nous votre marque à la même adresse.</p>
      </ContentSection>
    </ContentPage>
  );
}
