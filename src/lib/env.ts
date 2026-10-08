/**
 * Accès centralisé aux variables d'environnement.
 * Les variables publiques sont lues telles quelles ; les secrets ne sont
 * disponibles que côté serveur.
 */

/**
 * URL publique du site (sans slash final). Ordre de priorité :
 * `NEXT_PUBLIC_SITE_URL`, puis les variables système Vercel (domaine de
 * production, sinon URL du déploiement de preview), puis le dev local.
 * Sert uniquement côté serveur (liens e-mail, OAuth, retours Stripe).
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
      : process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;
  return "http://localhost:3000";
}

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  siteUrl: resolveSiteUrl(),
};

export const isSupabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseKey);

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

export const serverEnv = {
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get geminiApiKey() {
    return required("GEMINI_API_KEY");
  },
  get stripeSecretKey() {
    return required("STRIPE_SECRET_KEY");
  },
  get stripeWebhookSecret() {
    return required("STRIPE_WEBHOOK_SECRET");
  },
  get tryOnProvider() {
    return process.env.TRYON_PROVIDER ?? "gemini";
  },
};
