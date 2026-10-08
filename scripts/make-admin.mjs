#!/usr/bin/env node
/**
 * Donne le rôle admin à un utilisateur existant.
 * Usage : node scripts/make-admin.mjs vous@exemple.fr
 * Lit NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Usage : node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase.from("profiles").update({ role: "admin" }).eq("email", email).select("id");
if (error) {
  console.error(error.message);
  process.exit(1);
}
if (!data?.length) {
  console.error(`Aucun profil avec l'e-mail ${email}. Créez d'abord le compte via l'app.`);
  process.exit(1);
}
console.log(`${email} est maintenant administrateur.`);
