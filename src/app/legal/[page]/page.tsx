import type { Metadata } from "next";
import { notFound } from "next/navigation";

const PAGES: Record<string, { title: string; sections: Array<[string, string]> }> = {
  cgu: {
    title: "Conditions générales d'utilisation",
    sections: [
      ["Objet", "Checkmyfit permet de visualiser des vêtements sur soi grâce à la génération d'image par IA, puis d'accéder aux sites marchands qui les vendent. Checkmyfit ne vend aucun produit et n'intervient pas dans la transaction avec le marchand."],
      ["Compte", "L'accès à l'essayage virtuel nécessite un compte. Vous êtes responsable de la confidentialité de vos identifiants."],
      ["Crédits IA", "Chaque essayage consomme un crédit. 20 crédits sont offerts à l'inscription. Les crédits achetés ne sont ni remboursables ni transférables, sauf échec technique de la génération, auquel cas le crédit est automatiquement restitué."],
      ["Rendus générés", "Les images générées sont des simulations. Elles ne garantissent ni la taille, ni la coupe, ni le rendu réel du produit."],
      ["Liens affiliés", "Les liens vers les marchands sont des liens d'affiliation : Checkmyfit peut percevoir une commission sur les achats réalisés, sans coût supplémentaire pour vous."],
    ],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    sections: [
      ["Données collectées", "Adresse e-mail, photo de référence, images générées, vêtements ajoutés à votre dressing, historique de crédits et de clics vers les marchands."],
      ["Photo de référence", "Votre photo est stockée de façon privée et n'est utilisée que pour générer vos essayages. Elle est transmise au fournisseur d'IA le temps de la génération, puis n'est pas conservée par celui-ci à des fins d'entraînement selon ses conditions. Vous pouvez la remplacer à tout moment depuis votre compte."],
      ["Conservation", "Vos données sont conservées tant que votre compte est actif. La suppression du compte entraîne la suppression de la photo, des rendus et du dressing."],
      ["Paiement", "Les paiements sont traités par Stripe. Checkmyfit ne stocke aucune donnée bancaire."],
      ["Vos droits", "Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité. Contactez-nous à l'adresse indiquée dans les mentions légales."],
    ],
  },
  mentions: {
    title: "Mentions légales",
    sections: [
      ["Éditeur", "Checkmyfit — informations de la société à compléter (raison sociale, adresse, SIREN, contact)."],
      ["Hébergement", "Application hébergée sur Vercel ; données hébergées par Supabase (Union européenne)."],
      ["Contact", "Adresse e-mail de contact à compléter."],
    ],
  },
};

export async function generateMetadata({ params }: PageProps<"/legal/[page]">): Promise<Metadata> {
  const { page } = await params;
  return { title: PAGES[page]?.title ?? "Informations légales" };
}

export default async function LegalPage({ params }: PageProps<"/legal/[page]">) {
  const { page } = await params;
  const content = PAGES[page];
  if (!content) notFound();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-5 sm:py-14">
      <h1 className="font-display text-4xl text-palissandre">{content.title}</h1>
      <p className="mt-2 font-body text-xs text-noyer">Dernière mise à jour : septembre 2026. Document de travail à faire valider.</p>
      <div className="mt-8 flex flex-col gap-6">
        {content.sections.map(([heading, text]) => (
          <div key={heading}>
            <h2 className="label mb-1 text-wenge">{heading}</h2>
            <p className="font-body text-sm text-palissandre">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
