import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/layout/content-page";
import { ButtonLink } from "@/components/ui/button";
import { SIGNUP_BONUS_CREDITS } from "@/lib/credits/packs";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "À propos",
  description: `${SITE.name} vous montre un vêtement sur vous avant l'achat, grâce à l'IA.`,
};

export default function AboutPage() {
  return (
    <ContentPage
      title="À propos"
      intro={`${SITE.name} est né d'un constat simple : on achète trop souvent des vêtements qui, une fois portés, ne ressemblent pas à ce qu'on imaginait.`}
    >
      <ContentSection heading="Notre idée">
        <p>
          Vous déposez une seule photo de vous. Ensuite, pour chaque pièce du catalogue, l&apos;IA génère une image de
          vous la portant. Vous voyez le rendu avant d&apos;acheter, pas après.
        </p>
      </ContentSection>
      <ContentSection heading="Un dressing, pas une boutique">
        <p>
          Vos essayages sont rangés dans « Futurs achats », à côté des vêtements que vous possédez déjà. De quoi
          composer une tenue et acheter moins, mais mieux.
        </p>
      </ContentSection>
      <ContentSection heading="Comment nous gagnons notre vie">
        <p>
          Nous ne vendons pas de vêtements. Quand vous achetez chez un marchand partenaire depuis le site, il nous
          verse une petite commission, sans surcoût pour vous. Les crédits IA, eux, financent le coût de génération
          des images : {SIGNUP_BONUS_CREDITS} sont offerts à l&apos;inscription.
        </p>
      </ContentSection>
      <ContentSection heading="Votre photo vous appartient">
        <p>
          Elle reste privée, ne sert qu&apos;à vos essayages et peut être supprimée en un clic depuis votre compte.
        </p>
      </ContentSection>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/essayage">Essayer sur moi</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Nous écrire
        </ButtonLink>
      </div>
    </ContentPage>
  );
}
