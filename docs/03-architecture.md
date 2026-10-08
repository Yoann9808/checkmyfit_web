# Checkmyfit — Architecture technique

## Stack

| Couche | Choix | Pourquoi |
|---|---|---|
| Front + API | Next.js 15 (App Router, TypeScript, Server Actions, Route Handlers) | Un seul dépôt, SSR pour le SEO catalogue, déploiement Vercel |
| UI | Tailwind CSS + composants maison repris de la maquette, icônes lucide-react | La maquette est déjà en Tailwind + lucide |
| Auth, base, stockage | Supabase (Postgres, Auth e-mail + Google, Storage, RLS) | Connecteur déjà branché sur le compte, RLS pour isoler les photos |
| Paiement | Stripe Checkout + webhook | Zéro donnée carte chez nous, reçus natifs |
| IA try-on | Fournisseur derrière une interface `TryOnProvider` ; implémentation initiale Gemini (image generation) | Interchangeable, cf. section IA |
| Validation | zod | Schémas partagés front / back / CSV |
| CSV | papaparse | Import admin |
| Hébergement | Vercel | Preview par branche |

## Modèle de données (Postgres / Supabase)

```
profiles            id (= auth.users.id), email, role ('user'|'admin'), reference_photo_path,
                    credits_balance (cache maintenu par trigger), onboarding_seen, created_at

credit_transactions id, user_id, delta (int, signé), reason ('signup_bonus'|'tryon'|'refund'|'purchase'),
                    ref_id (tryon_id ou stripe_event_id), created_at
                    -> source de vérité du solde (ledger), solde = SUM(delta)

products            id, external_id (clé d'upsert CSV), slug, name, brand, category, gender ('Femme'|'Homme'|'Unisexe'),
                    price, currency, color, description, care, made_in, size_advice, sizes text[],
                    image_path (Storage), image_source_url, merchant, affiliate_url,
                    is_popular, is_new, is_active, created_at, updated_at

catalog_imports     id, admin_id, filename, rows_total, rows_ok, rows_error, errors jsonb, created_at

tryons              id, user_id, product_id, status ('queued'|'processing'|'succeeded'|'failed'),
                    provider, result_path, error, created_at, completed_at
                    UNIQUE (user_id, product_id)  -> "déjà généré, gratuit à revoir"

wardrobe_items      id, user_id, kind ('tryon'|'owned'), tryon_id, product_id,
                    brand, category, color, photo_path, created_at

affiliate_clicks    id, user_id (nullable), product_id, referrer, created_at

stripe_events       id (= event.id Stripe), type, processed_at   -> idempotence webhook
```

### Stockage (buckets)

- `reference-photos` : privé, un objet par user, accès via URL signée courte.
- `tryon-results` : privé, accès via URL signée.
- `wardrobe` : privé.
- `products` : public, images catalogue téléchargées à l'import.

### RLS

- `profiles`, `credit_transactions`, `tryons`, `wardrobe_items` : lecture / écriture limitées à `auth.uid() = user_id`. Écritures sensibles (crédits, tryons) passent par des fonctions SQL `security definer` appelées côté serveur.
- `products` : lecture publique si `is_active`, écriture réservée au rôle admin.
- `catalog_imports`, `stripe_events` : admin / service role uniquement.

## Pipeline d'essayage IA

1. Le client appelle une Server Action `startTryOn(productId)`.
2. Fonction SQL `spend_credit_for_tryon(user, product)` en une transaction : vérifie le solde, insère la ligne `credit_transactions` (delta −1), crée la ligne `tryons` en `queued`. Si un rendu `succeeded` existe déjà, retourne son id sans débiter.
3. Le serveur charge la photo de référence et l'image produit, appelle `TryOnProvider.generate()`.
4. Succès : upload du résultat dans `tryon-results`, statut `succeeded`.
   Échec : statut `failed`, insertion d'un `refund` (+1).
5. Le client affiche l'écran "generating" et interroge le statut (polling toutes les 1,5 s, ou Supabase Realtime), puis bascule sur "result".

Interface fournisseur :

```ts
interface TryOnProvider {
  name: string;
  generate(input: {
    personImage: Buffer; garmentImage: Buffer;
    garment: { name: string; category: string; color: string; description: string };
  }): Promise<{ image: Buffer; mimeType: string }>;
}
```

Implémentations prévues : `gemini` (par défaut), puis `google-vto` (Vertex AI Virtual Try-On) ou `fal` (Kling / IDM-VTON) pour comparer la qualité sur les vêtements seuls.

## Crédits et Stripe

- Packs définis en code : 10 crédits 4,99 €, 30 crédits 12,99 €, 100 crédits 34,99 €.
- Server Action `createCheckoutSession(packId)` → Stripe Checkout (mode payment), `metadata.user_id` et `metadata.credits`.
- Route Handler `/api/stripe/webhook` : vérifie la signature, ignore les événements déjà présents dans `stripe_events`, insère `credit_transactions` (+N, reason `purchase`, ref = event id).
- L'écran de confirmation lit le solde depuis la base, jamais depuis l'URL de retour.

## Import catalogue (admin)

- Page `/admin/import` : upload CSV, aperçu des 10 premières lignes, validation zod par ligne, rapport d'erreurs téléchargeable, upsert sur `external_id`.
- Colonnes du template : `external_id, name, brand, category, gender, price, currency, color, description, care, made_in, size_advice, sizes (séparées par |), image_url, merchant, affiliate_url, is_popular, is_new`.
- Les images sont téléchargées côté serveur depuis `image_url` et stockées dans le bucket `products` (fichier renommé par `external_id`).
- Page `/admin/products` : liste, recherche, édition unitaire, activation / désactivation.

## Design system (repris de la maquette)

Couleurs : argile `#F5E8DC` (fond), terracotta `#B05C2A` (primaire), palissandre `#4A2009` (titres), chêne pâle `#DECCB0`, chêne doré `#C2A47A`, noyer `#9A7040`, wengé `#6B4C24`, ébène `#221608`, sable brûlé `#D4A882`, brique `#7A3A16` (hover primaire).
Typographies : Fraunces 300 (display, italique pour l'accent), DM Sans 300 / 500 (corps, labels en capitales espacées).
Formes : boutons pilule, cartes `rounded-2xl`, conteneurs `rounded-3xl`, bordures fines chêne doré.

## Sécurité et conformité

- Photos de référence : bucket privé, suppression à la demande, durée de conservation documentée dans la politique de confidentialité.
- Consentement explicite à l'upload.
- Rate limiting sur `startTryOn` et l'upload (Upstash Ratelimit ou compteur en base).
- Secrets uniquement côté serveur (clé IA, clé Stripe, service role Supabase).
