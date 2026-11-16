/**
 * Informations sur l'éditeur, réutilisées par les pages légales, contact et FAQ.
 * Les valeurs `null` sont affichées « à compléter » : à renseigner dès que la
 * micro-entreprise est immatriculée (SIRET, adresse, responsable de publication).
 */
export const SITE = {
  name: "CheckMyFit",
  url: "https://checkmyfit.fr",
  contactEmail: "contact@checkmyfit.fr",
  company: {
    legalForm: "Micro-entreprise (en cours d'immatriculation)",
    owner: null as string | null,
    siret: null as string | null,
    address: null as string | null,
    publicationDirector: null as string | null,
    /** Micro-entreprise en franchise de TVA : mention à confirmer avec le statut définitif. */
    vatMention: "TVA non applicable, art. 293 B du CGI",
  },
  minimumAge: 15,
} as const;

export const TO_COMPLETE = "[à compléter]";
