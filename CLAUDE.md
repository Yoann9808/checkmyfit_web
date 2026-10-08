# Checkmyfit

App web d'essayage virtuel par IA. Modèle économique : **affiliation** (pas de panier ni de paiement produit). Monétisation par crédits IA (20 offerts, packs Stripe).

## Références

- `docs/01-features.md` : liste des features priorisées (P0/P1/P2).
- `docs/02-roadmap.md` : phases de développement.
- `docs/03-architecture.md` : stack, modèle de données, pipeline IA, Stripe, import CSV, design system.
- `artefact/maquette_mvp` : maquette React d'origine (ligne directrice, pas une spec figée ; les écrans panier / checkout / commandes sont obsolètes).

## Stack

Next.js 16 (App Router, TypeScript, `src/`), Tailwind v4 (tokens dans `src/app/globals.css`), Supabase (auth, Postgres, storage), Stripe Checkout, Gemini pour la génération d'image.

## Conventions

- Langue de l'interface : français. Code et identifiants : anglais.
- Routes publiques en français : `/catalogue`, `/produit/[slug]`, `/essayage`, `/dressing`, `/compte`, `/credits`, `/connexion`, `/inscription`, `/onboarding/photo`, `/admin/...`.
- Couleurs uniquement via les tokens Tailwind (`bg-argile`, `text-terracotta`, …), jamais en hexadécimal dans les composants.
- Typo : `font-display` (Fraunces) pour les titres, `font-body` (DM Sans) pour le reste, classe `.label` pour les libellés en capitales.
- Mobile d'abord : la barre d'onglets mobile (`MobileTabBar`) occupe le bas de l'écran sous `md`. Toute barre d'action fixe doit se placer au-dessus (`bottom-16 md:bottom-0`).
- Écritures sensibles (crédits, essayages, imports) : uniquement via fonctions SQL `security definer` ou client service role côté serveur. Jamais depuis le navigateur.
- Migrations dans `supabase/migrations/`, appliquées avec `npx supabase db reset` en local. Types régénérés avec `npm run db:types`.

## Commandes

```
npm run dev          # serveur de dev
npm run build        # build de production
npm run lint         # eslint
npm run db:start     # supabase local (Docker requis)
npm run db:reset     # rejoue les migrations + seed
npm run db:types     # régénère src/lib/supabase/database.types.ts
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
