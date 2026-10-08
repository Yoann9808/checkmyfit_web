# Checkmyfit

Essayez les vêtements sur vous avant d'acheter, grâce à la génération d'image par IA. Modèle économique : affiliation + crédits IA.

## Démarrer en local

Prérequis : Node 22, Docker Desktop (pour la base Supabase locale).

```bash
npm install
npm run db:start        # démarre Supabase en local (ports 544xx)
npm run db:reset        # applique les migrations + le jeu de démo (7 produits)
npm run dev             # http://localhost:3000
```

`.env.local` est déjà renseigné pour la base locale. Pour un projet Supabase hébergé, remplacez `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` et `SUPABASE_SERVICE_ROLE_KEY`, puis appliquez `supabase/migrations/` (`npx supabase db push` après `npx supabase link`).

### Clés à renseigner dans `.env.local`

| Variable | Rôle | Sans elle |
|---|---|---|
| `GEMINI_API_KEY` | génération des essayages (Google AI Studio) | l'essayage échoue et rembourse le crédit |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | achat de crédits | le bouton de paiement est désactivé |
| Google OAuth (dans Supabase : Authentication → Providers) | bouton "Continuer avec Google" | l'e-mail + mot de passe fonctionne |

Webhook Stripe en local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`. Sans webhook, la page de confirmation crédite quand même l'achat (idempotent).

### Devenir administrateur

1. Créez votre compte dans l'app (`/inscription`).
2. `npm run db:admin -- vous@exemple.fr`
3. Ouvrez `/admin` : import CSV, produits, tableau de bord.

## Déployer sur Vercel

Prérequis : un projet Supabase **hébergé** (la base locale Docker n'est pas joignable depuis Vercel).

1. **Supabase** : `npx supabase link --project-ref <ref>` puis `npx supabase db push` (applique `supabase/migrations/`, sans le jeu de démo). Dans Authentication → URL Configuration : *Site URL* = domaine de production, *Redirect URLs* = `https://<domaine>/auth/callback` (ajouter `https://*-<équipe>.vercel.app/auth/callback` pour les previews).
2. **Vercel** : importer le dépôt Git (framework Next.js détecté, aucun réglage de build). Garder *Fluid Compute* activé (défaut) : l'essayage et l'import CSV demandent 120 s et 300 s d'exécution.
3. **Variables d'environnement** (Production et Preview), voir `.env.example` :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | projet Supabase hébergé |
| `SUPABASE_SERVICE_ROLE_KEY` | clé secrète Supabase |
| `NEXT_PUBLIC_SITE_URL` | domaine public, en Production uniquement (les previews utilisent leur propre URL) |
| `GEMINI_API_KEY` | Google AI Studio |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe (clés de test en Preview) |

4. **Stripe** : créer un webhook vers `https://<domaine>/api/stripe/webhook` avec les événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`, puis reporter son secret dans `STRIPE_WEBHOOK_SECRET`.
5. **Admin** : après inscription sur le site, lancer `npm run db:admin -- vous@exemple.fr` avec un `.env.local` pointant sur la base hébergée.

Limites à connaître : un import CSV fait 4 Mo maximum et s'arrête au bout de 4 minutes (relancer le même fichier reprend là où il s'est arrêté) ; avec la *Deployment Protection* Vercel active sur les previews, l'essayage des produits dont l'image est servie par le site (`/seed/…`) échoue, les images du bucket `products` ne sont pas concernées.

## Scripts

```
npm run dev / build / start
npm run lint / typecheck / format
npm run db:start / db:stop / db:reset / db:types
npm run db:admin -- <email>
npm run test:db          # test d'intégration crédits + RLS sur la base locale
```

## Documentation

Voir `docs/` : `01-features.md` (features priorisées), `02-roadmap.md` (phases), `03-architecture.md` (stack, schéma, pipeline IA, Stripe, import CSV, design system).
