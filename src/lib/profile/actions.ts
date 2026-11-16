"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSessionUser } from "@/lib/auth/session";
import { safeInternalPath } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

const safeNext = (next: unknown) => safeInternalPath(next, "/essayage");

const PRIVATE_BUCKETS = ["reference-photos", "tryon-results", "wardrobe"] as const;
type PrivateBucket = (typeof PRIVATE_BUCKETS)[number];

/** Supprime tous les fichiers d'un utilisateur dans un bucket (dossier `<uid>/`). */
async function removeUserFolder(supabase: SupabaseClient<Database>, bucket: PrivateBucket, userId: string) {
  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(userId, { limit: 100 });
    if (error) throw error;
    if (!data?.length) return;
    const { error: rmErr } = await supabase.storage.from(bucket).remove(data.map((f) => `${userId}/${f.name}`));
    if (rmErr) throw rmErr;
    if (data.length < 100) return;
  }
}

/**
 * Enregistre le chemin de la photo de référence (déjà uploadée par le navigateur
 * dans le bucket privé `reference-photos/<uid>/…`) et le consentement.
 * Pour un compte Google, horodate aussi la confirmation d'âge et des CGU.
 */
export async function setReferencePhotoAction(formData: FormData) {
  const session = await requireSessionUser("/onboarding/photo");
  const path = String(formData.get("path") ?? "");
  const consent = formData.get("consent") === "on";
  const next = safeNext(String(formData.get("next") ?? ""));
  const needsAge = !session.profile.age_confirmed_at;

  if (!path.startsWith(`${session.id}/`)) {
    redirect(`/onboarding/photo?erreur=chemin&next=${encodeURIComponent(next)}`);
  }
  if (!consent) {
    redirect(`/onboarding/photo?erreur=consentement&next=${encodeURIComponent(next)}`);
  }
  if (needsAge && formData.get("ageAndTerms") !== "on") {
    redirect(`/onboarding/photo?erreur=age&next=${encodeURIComponent(next)}`);
  }

  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();
  const previous = session.profile.reference_photo_path;
  const { error } = await supabase
    .from("profiles")
    .update({
      reference_photo_path: path,
      photo_consent_at: now,
      ...(needsAge ? { age_confirmed_at: now, terms_accepted_at: now } : {}),
    })
    .eq("id", session.id);
  if (error) {
    console.error("setReferencePhoto :", error);
    redirect(`/onboarding/photo?erreur=enregistrement&next=${encodeURIComponent(next)}`);
  }

  // Une seule photo conservée : l'ancienne est effacée
  if (previous && previous !== path) {
    await supabase.storage.from("reference-photos").remove([previous]);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

/** Retire le consentement : efface la photo de référence et son horodatage. */
export async function deleteReferencePhotoAction() {
  const session = await requireSessionUser("/compte");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ reference_photo_path: null, photo_consent_at: null })
    .eq("id", session.id);
  if (error) {
    console.error("deleteReferencePhoto :", error);
    redirect("/compte?erreur=photo");
  }
  try {
    await removeUserFolder(supabase, "reference-photos", session.id);
  } catch (e) {
    console.error("deleteReferencePhoto (storage) :", e);
  }

  revalidatePath("/", "layout");
  redirect("/compte?photo=supprimee");
}

export async function markOnboardingSeenAction() {
  const session = await requireSessionUser("/dressing");
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ onboarding_seen: true }).eq("id", session.id);
  revalidatePath("/dressing");
}

/**
 * Supprime définitivement le compte : fichiers privés puis utilisateur Auth
 * (la suppression en cascade efface profil, essayages, dressing, sauvegardes, crédits).
 * Exige la saisie de « SUPPRIMER ». Opération système : client service role.
 */
export async function deleteAccountAction(formData: FormData) {
  const session = await requireSessionUser("/compte");
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "SUPPRIMER") {
    redirect("/compte?erreur=confirmation#supprimer");
  }

  const admin = createSupabaseAdminClient();
  try {
    for (const bucket of PRIVATE_BUCKETS) await removeUserFolder(admin, bucket, session.id);
  } catch (e) {
    console.error("deleteAccount (storage) :", e);
    redirect("/compte?erreur=suppression#supprimer");
  }

  const { error } = await admin.auth.admin.deleteUser(session.id);
  if (error) {
    console.error("deleteAccount :", error);
    redirect("/compte?erreur=suppression#supprimer");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/?compte=supprime");
}
