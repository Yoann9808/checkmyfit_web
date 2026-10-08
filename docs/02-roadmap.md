# Checkmyfit — Roadmap de développement

Découpage en phases livrables et testables. Chaque phase se termine par une démo fonctionnelle.
Les références (A1, C4…) renvoient à `01-features.md`.

## Phase 0 — Fondations

Objectif : un projet qui tourne, avec le design system et la base prête.

- Initialisation Next.js (App Router, TypeScript), Tailwind, ESLint, Prettier, git.
- Projet Supabase : schéma initial (profiles, products, credit_transactions, tryons, wardrobe_items, affiliate_clicks, catalog_imports), RLS, buckets de stockage.
- Design system G1 : tokens, polices, composants atomiques repris de la maquette.
- Layout global : header (sans panier), footer, menu mobile G2.
- Déploiement continu sur Vercel (preview par branche).

## Phase 1 — Catalogue et back-office

Objectif : tu peux importer ton catalogue, un visiteur peut le parcourir et cliquer vers le marchand.

- Admin F1, F2, F3, F4, F5, F7.
- Public A1, A2, A3, A4, A5.
- Tracking des clics affiliés.
- Pages légales G3 en version brouillon.

## Phase 2 — Compte, photo, crédits offerts

Objectif : un visiteur crée un compte, dépose sa photo, voit ses 20 crédits.

- Auth B1, B2, redirections B7.
- Upload photo B3, B4, B9 (bucket privé, URL signées).
- Ledger de crédits et bonus d'inscription B5.
- Profil B6 (sans historique d'essayages pour l'instant).
- Solde dans le header E1.

## Phase 3 — Essayage IA

Objectif : la feature cœur fonctionne de bout en bout avec un vrai fournisseur IA.

- Abstraction fournisseur C9 et implémentation Gemini.
- Débit / remboursement atomique C3, rate limiting G5.
- Écrans essayage C1, C2, C4, C5, C6, C7, C8, encart A6.
- Historique "Mes essayages" sur le profil B6.
- Mesure : coût par rendu, taux d'échec, latence.

## Phase 4 — Dressing virtuel

Objectif : sauvegarder et organiser ses rendus et ses propres vêtements.

- D1 à D7.

## Phase 5 — Achat de crédits (Stripe)

Objectif : monétisation active.

- E2, E3, E4, E5 (Stripe Checkout + webhook idempotent).
- Mode test puis passage en production Stripe.

## Phase 6 — Qualité, conformité, lancement

- Suppression de compte B8, modération C13.
- SEO A10, analytics G4, e-mails G6, dashboard admin F6.
- Tests end-to-end du parcours complet (inscription → photo → essayage → dressing → achat crédits).
- Revue sécurité (RLS, webhooks, uploads) et revue RGPD (durée de conservation des photos).

## Après le MVP (P1 / P2 restants)

Recherche A7, tri A8, avis A9, régénération C10, comparaison C11, partage C12, essayage depuis le dressing D8, gestion des marchands F8.

---

## Statut au 16/09/2026

| Phase | État | Reste à faire |
|---|---|---|
| 0 Fondations | Fait | Déploiement Vercel (compte à connecter), projet Supabase hébergé (limite free tier atteinte) |
| 1 Catalogue + back-office | Fait | Tester un import CSV réel avec tes données |
| 2 Compte, photo, crédits offerts | Fait | Activer Google OAuth dans Supabase (client ID / secret) |
| 3 Essayage IA | Code en place, **non testé** | Renseigner `GEMINI_API_KEY` et valider la qualité des rendus |
| 4 Dressing | Fait | — |
| 5 Stripe | Code en place, **non testé** | Renseigner les clés Stripe, tester en mode test |
| 6 Qualité, conformité, lancement | À faire | Suppression de compte, modération, SEO, analytics, e-mails, tests E2E |
