/**
 * Test d'intégration : bonus d'inscription, débit / remboursement de crédits, RLS.
 * Prérequis : base Supabase locale démarrée (npm run db:start) et .env.local renseigné.
 * Usage : npm run test:db
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envPath = new URL("../.env.local", import.meta.url);
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const email = `test-${Date.now()}@checkmyfit.local`;
const password = "motdepasse-test-123";

const log = (...a) => console.log("•", ...a);
const assert = (cond, msg) => {
  if (!cond) {
    console.error("✗", msg);
    process.exit(1);
  }
  log("ok:", msg);
};

// 1. Création d'un utilisateur → profil + 20 crédits
const { data: created, error: cErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (cErr) throw cErr;
const uid = created.user.id;
let { data: profile } = await admin.from("profiles").select("*").eq("id", uid).single();
assert(profile?.credits_balance === 20, "20 crédits offerts à l'inscription");

// 2. Client utilisateur
const user = createClient(url, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const { error: sErr } = await user.auth.signInWithPassword({ email, password });
if (sErr) throw sErr;

// 3. Un utilisateur ne peut pas modifier son solde ni son rôle
const { error: hackErr } = await user.from("profiles").update({ credits_balance: 999 }).eq("id", uid);
assert(hackErr, "mise à jour directe du solde refusée");
const { error: roleErr } = await user.from("profiles").update({ role: "admin" }).eq("id", uid);
assert(roleErr, "mise à jour directe du rôle refusée");
const { error: okErr } = await user.from("profiles").update({ onboarding_seen: true }).eq("id", uid);
assert(!okErr, "mise à jour de onboarding_seen autorisée");

// 4. start_tryon → débit
const { data: product } = await admin.from("products").select("id").eq("is_active", true).limit(1).single();
const { data: t1, error: t1Err } = await user.rpc("start_tryon", { p_product_id: product.id });
assert(!t1Err && t1.status === "queued", "start_tryon crée un essayage en attente");
({ data: profile } = await admin.from("profiles").select("credits_balance").eq("id", uid).single());
assert(profile.credits_balance === 19, "1 crédit débité");

// 5. Relance sur le même produit en attente → pas de nouveau débit
const { data: t2 } = await user.rpc("start_tryon", { p_product_id: product.id });
assert(t2.id === t1.id, "relance renvoie le même essayage");
({ data: profile } = await admin.from("profiles").select("credits_balance").eq("id", uid).single());
assert(profile.credits_balance === 19, "pas de double débit");

// 6. Échec → remboursement
await admin.rpc("fail_tryon", { p_tryon_id: t1.id, p_error: "test" });
({ data: profile } = await admin.from("profiles").select("credits_balance").eq("id", uid).single());
assert(profile.credits_balance === 20, "crédit remboursé après échec");
await admin.rpc("fail_tryon", { p_tryon_id: t1.id, p_error: "test" });
({ data: profile } = await admin.from("profiles").select("credits_balance").eq("id", uid).single());
assert(profile.credits_balance === 20, "double remboursement impossible");

// 7. Nouvelle tentative après échec → nouveau débit, attempt = 2
const { data: t3 } = await user.rpc("start_tryon", { p_product_id: product.id });
assert(t3.id === t1.id && t3.attempt === 2 && t3.status === "queued", "retry réutilise la ligne, attempt 2");
({ data: profile } = await admin.from("profiles").select("credits_balance").eq("id", uid).single());
assert(profile.credits_balance === 19, "crédit débité pour la nouvelle tentative");

// 8. Solde à 0 → refus
await admin.from("credit_transactions").insert({ user_id: uid, delta: -19, reason: "admin_adjustment", ref_id: `test-${uid}` });
const { data: product2 } = await admin.from("products").select("id").eq("is_active", true).range(1, 1).single();
const { error: noCredit } = await user.rpc("start_tryon", { p_product_id: product2.id });
assert(noCredit?.message.includes("INSUFFICIENT_CREDITS"), "refus quand le solde est à 0");

// 9. Un autre utilisateur ne voit pas les essayages du premier
const other = createClient(url, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const { data: o } = await admin.auth.admin.createUser({ email: `other-${Date.now()}@checkmyfit.local`, password, email_confirm: true });
await other.auth.signInWithPassword({ email: o.user.email, password });
const { data: leak } = await other.from("tryons").select("id").eq("user_id", uid);
assert((leak ?? []).length === 0, "RLS : essayages invisibles pour un autre utilisateur");

// 10. Achat idempotent
await admin.from("credit_transactions").insert({ user_id: uid, delta: 30, reason: "purchase", ref_id: "cs_test_1" });
const { error: dup } = await admin.from("credit_transactions").insert({ user_id: uid, delta: 30, reason: "purchase", ref_id: "cs_test_1" });
assert(dup?.code === "23505", "double créditation d'un même paiement refusée");


// 11. Stockage : un utilisateur n'écrit que dans son dossier, et ne lit pas celui des autres
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const { error: upOk } = await user.storage.from("reference-photos").upload(`${uid}/reference.png`, png, { contentType: "image/png" });
assert(!upOk, "upload dans son propre dossier autorisé");
const { error: upKo } = await user.storage.from("reference-photos").upload(`${o.user.id}/reference.png`, png, { contentType: "image/png" });
assert(upKo, "upload dans le dossier d'un autre utilisateur refusé");
const { data: signedKo } = await other.storage.from("reference-photos").createSignedUrl(`${uid}/reference.png`, 60);
assert(!signedKo?.signedUrl, "URL signée sur la photo d'un autre utilisateur refusée");
const { data: signedOk } = await user.storage.from("reference-photos").createSignedUrl(`${uid}/reference.png`, 60);
assert(signedOk?.signedUrl, "URL signée sur sa propre photo autorisée");
await admin.storage.from("reference-photos").remove([`${uid}/reference.png`]);

// Nettoyage
await admin.auth.admin.deleteUser(uid);
await admin.auth.admin.deleteUser(o.user.id);
console.log("\nTous les tests passent.");
