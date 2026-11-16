import { CREDIT_PACKS, SIGNUP_BONUS_CREDITS } from "@/lib/credits/packs";
import { SITE, TO_COMPLETE } from "@/lib/site";

export type LegalSection = { id?: string; heading: string; body: string[] };
export type LegalPage = { title: string; updated: string; intro?: string; sections: LegalSection[] };

const c = SITE.company;
const orTodo = (v: string | null) => v ?? TO_COMPLETE;
const euros = (cents: number) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const packsLine = CREDIT_PACKS.map((p) => `${p.credits} crédits : ${euros(p.priceCents)}`).join(" · ");

const UPDATED = "novembre 2026";

/**
 * Textes légaux. Brouillons rédigés pour une micro-entreprise française éditrice
 * d'un service d'essayage par IA financé par l'affiliation et la vente de crédits.
 * À faire relire avant la mise en ligne publique.
 */
export const LEGAL_PAGES: Record<string, LegalPage> = {
  mentions: {
    title: "Mentions légales",
    updated: UPDATED,
    sections: [
      {
        heading: "Éditeur du site",
        body: [
          `${SITE.name}, ${c.legalForm}.`,
          `Responsable : ${orTodo(c.owner)}. SIRET : ${orTodo(c.siret)}.`,
          `Adresse : ${orTodo(c.address)}.`,
          `Contact : ${SITE.contactEmail}.`,
          `Directeur de la publication : ${orTodo(c.publicationDirector)}.`,
          `${c.vatMention}.`,
        ],
      },
      {
        heading: "Hébergement",
        body: [
          "Application : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).",
          "Base de données et fichiers : Supabase Inc., serveurs situés dans l'Union européenne (supabase.com).",
        ],
      },
      {
        heading: "Propriété intellectuelle",
        body: [
          `La marque ${SITE.name}, le logo, la charte graphique et les textes du site sont la propriété de l'éditeur. Toute reproduction sans autorisation est interdite.`,
          "Les photos et descriptions de produits appartiennent aux marques et marchands concernés et sont utilisées avec leur accord, dans le cadre de nos partenariats d'affiliation.",
        ],
      },
      {
        heading: "Affiliation",
        body: [
          `${SITE.name} ne vend aucun vêtement. Les boutons « Acheter chez… » renvoient vers les sites marchands via des liens d'affiliation : nous pouvons percevoir une commission sur vos achats, sans surcoût pour vous.`,
        ],
      },
    ],
  },

  confidentialite: {
    title: "Politique de confidentialité",
    updated: UPDATED,
    intro: `Cette politique explique quelles données ${SITE.name} collecte, pourquoi, combien de temps elles sont gardées et comment exercer vos droits (RGPD et loi Informatique et Libertés).`,
    sections: [
      {
        heading: "Responsable du traitement",
        body: [`${SITE.name} (${orTodo(c.owner)}), joignable à ${SITE.contactEmail}.`],
      },
      {
        heading: "Données collectées",
        body: [
          "Compte : adresse e-mail, mot de passe chiffré (ou identifiant Google), date d'acceptation des conditions et confirmation d'avoir l'âge minimum.",
          "Photo de référence : la photo que vous déposez, la date de votre consentement à son utilisation.",
          "Essayages et dressing : images générées, produits sauvegardés, vêtements ajoutés.",
          "Crédits : historique des crédits offerts, achetés et consommés. Les paiements sont traités par Stripe : nous ne voyons ni ne stockons votre carte.",
          "Clics vers les marchands : produit cliqué et date, pour le suivi des commissions.",
        ],
      },
      {
        heading: "Finalités et bases légales",
        body: [
          "Fournir le service (compte, essayages, dressing, crédits) : exécution du contrat.",
          "Utiliser votre photo pour générer les essayages : votre consentement, donné au dépôt de la photo et retirable à tout moment en supprimant la photo.",
          "Facturation et comptabilité des achats de crédits : obligation légale.",
          "Mesure des clics affiliés et sécurité du service : intérêt légitime.",
        ],
      },
      {
        heading: "Votre photo",
        body: [
          "La photo est stockée dans un espace privé, accessible uniquement par vous et par nos serveurs. Elle n'est jamais publiée ni partagée avec les marques.",
          "Au moment d'un essayage, elle est transmise au fournisseur d'IA (Google, API Gemini) le temps de la génération. Nous utilisons une offre dont les données ne servent pas à entraîner les modèles.",
          "La photo n'est pas utilisée pour vous identifier ni pour de la reconnaissance faciale.",
          "Vous pouvez la supprimer à tout moment depuis « Mon compte ». Elle est alors effacée de nos serveurs.",
        ],
      },
      {
        heading: "Âge minimum",
        body: [
          `Le service est réservé aux personnes de ${SITE.minimumAge} ans et plus, âge à partir duquel un mineur peut consentir seul au traitement de ses données en France. Ne déposez pas de photo d'une autre personne, ni d'un enfant.`,
        ],
      },
      {
        heading: "Destinataires et sous-traitants",
        body: [
          "Supabase (hébergement des données, UE), Vercel (hébergement de l'application), Google (génération d'images), Stripe (paiement).",
          "Certains de ces prestataires sont établis aux États-Unis. Les transferts sont encadrés par le Data Privacy Framework ou par les clauses contractuelles types de la Commission européenne.",
          "Quand vous cliquez vers un marchand, vous quittez le site : la politique de confidentialité du marchand et de la plateforme d'affiliation s'applique alors.",
        ],
      },
      {
        heading: "Durées de conservation",
        body: [
          "Compte, photo, essayages, dressing : tant que le compte est actif. Supprimés sans délai à la suppression du compte, et après 3 ans d'inactivité.",
          "Justificatifs d'achat de crédits : 10 ans (obligation comptable).",
          "Clics affiliés : 13 mois.",
        ],
      },
      {
        heading: "Vos droits",
        body: [
          "Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition, ainsi que du droit de retirer votre consentement.",
          "La suppression de la photo et du compte est disponible directement dans « Mon compte ». Pour les autres demandes, écrivez à " +
            SITE.contactEmail +
            ". Nous répondons sous un mois.",
          "Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).",
        ],
      },
    ],
  },

  cgu: {
    title: "Conditions générales d'utilisation et de vente",
    updated: UPDATED,
    intro: `Les CGU encadrent l'utilisation de ${SITE.name}. Les CGV s'appliquent à l'achat de crédits IA. Créer un compte vaut acceptation des deux.`,
    sections: [
      {
        id: "cgu",
        heading: "CGU · Objet du service",
        body: [
          `${SITE.name} permet de visualiser des vêtements sur soi grâce à la génération d'images par IA, de les ranger dans un dressing virtuel, puis d'accéder aux sites marchands qui les vendent. ${SITE.name} ne vend aucun vêtement et n'intervient pas dans la transaction avec le marchand.`,
        ],
      },
      {
        heading: "CGU · Compte et âge minimum",
        body: [
          `L'inscription est réservée aux personnes âgées d'au moins ${SITE.minimumAge} ans. Les mineurs doivent obtenir l'accord d'un parent avant tout achat de crédits.`,
          "Vous êtes responsable de la confidentialité de vos identifiants. Vous pouvez supprimer votre compte à tout moment depuis « Mon compte ».",
        ],
      },
      {
        heading: "CGU · Votre photo",
        body: [
          "Vous ne déposez qu'une photo de vous-même, dont vous détenez les droits. Sont interdites : les photos d'une autre personne sans son accord, les photos d'enfants, les contenus dénudés, violents ou illicites.",
          "Vous nous autorisez à utiliser cette photo uniquement pour générer vos essayages. Cette autorisation prend fin dès que vous supprimez la photo ou le compte.",
          "Nous pouvons supprimer une photo non conforme et suspendre le compte concerné.",
        ],
      },
      {
        heading: "CGU · Rendus générés",
        body: [
          "Les images générées sont des simulations. Elles ne garantissent ni la taille, ni la coupe, ni la couleur, ni le rendu réel du produit. Vérifiez toujours le guide des tailles du marchand.",
          "Vous pouvez utiliser vos rendus à titre personnel. Leur usage commercial est interdit.",
        ],
      },
      {
        heading: "CGU · Liens affiliés et marchands",
        body: [
          "Les liens vers les marchands sont des liens d'affiliation. Le prix, la disponibilité, la livraison, les retours et le service client relèvent du seul marchand.",
        ],
      },
      {
        heading: "CGU · Responsabilité",
        body: [
          "Nous faisons notre possible pour que le service soit disponible et fiable, sans pouvoir le garantir en continu. Notre responsabilité ne saurait être engagée pour un achat effectué chez un marchand.",
        ],
      },
      {
        id: "cgv",
        heading: "CGV · Crédits IA",
        body: [
          `Chaque essayage consomme 1 crédit. ${SIGNUP_BONUS_CREDITS} crédits sont offerts à l'inscription. Revoir un essayage déjà généré est gratuit.`,
          `Packs proposés (prix TTC) : ${packsLine}. ${c.vatMention}.`,
          "Les crédits n'expirent pas tant que le compte est actif. Ils ne sont ni remboursables, ni transférables, ni convertibles en argent.",
        ],
      },
      {
        heading: "CGV · Commande et paiement",
        body: [
          "Le paiement s'effectue par carte via Stripe, prestataire de paiement sécurisé. Les crédits sont ajoutés au compte dès la confirmation du paiement. Un reçu est envoyé par e-mail.",
        ],
      },
      {
        heading: "CGV · Droit de rétractation",
        body: [
          "Les crédits sont un contenu numérique fourni immédiatement après l'achat. En validant la commande, vous demandez leur mise à disposition immédiate et reconnaissez perdre votre droit de rétractation (article L221-28 13° du Code de la consommation).",
          "Si une génération échoue pour une raison technique, le crédit est restitué automatiquement.",
        ],
      },
      {
        heading: "CGV · Réclamations et médiation",
        body: [
          `Pour toute réclamation : ${SITE.contactEmail}. En cas de litige non résolu, vous pouvez recourir gratuitement au médiateur de la consommation : ${TO_COMPLETE}.`,
          "Les présentes conditions sont soumises au droit français.",
        ],
      },
    ],
  },

  cookies: {
    title: "Politique cookies",
    updated: UPDATED,
    intro:
      "Un cookie est un petit fichier déposé sur votre appareil. Voici ceux que le site utilise et comment gérer votre choix.",
    sections: [
      {
        heading: "Cookies nécessaires (toujours actifs)",
        body: [
          "Session de connexion (cookies « sb-… », Supabase) : vous garder connecté. Durée : celle de la session, renouvelée tant que vous êtes actif.",
          "Choix cookies (cookie « cmf_consent ») : mémoriser votre réponse au bandeau. Durée : 6 mois.",
          "Ces cookies sont indispensables au fonctionnement du site et ne demandent pas de consentement.",
        ],
      },
      {
        heading: "Mesure d'audience",
        body: [
          "Nous n'utilisons aujourd'hui aucun outil de mesure d'audience ni de publicité. Si nous en ajoutons, ils ne seront déposés qu'avec votre accord, donné via le bandeau.",
        ],
      },
      {
        heading: "Sites tiers",
        body: [
          "Le paiement (Stripe) et les sites marchands vers lesquels nous renvoyons peuvent déposer leurs propres cookies, notamment des cookies d'affiliation qui permettent d'attribuer votre achat. Ils sont régis par la politique de chaque site.",
        ],
      },
      {
        heading: "Modifier votre choix",
        body: [
          "Utilisez le lien « Gérer les cookies » en bas de chaque page pour afficher à nouveau le bandeau. Vous pouvez aussi supprimer les cookies depuis les réglages de votre navigateur.",
        ],
      },
    ],
  },
};
