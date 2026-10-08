"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { safeInternalPath } from "@/lib/utils";

const safeNext = (next: unknown) => safeInternalPath(next, "/essayage");

/**
 * Enregistre le chemin de la photo de référence (déjà uploadée par le navigateur
 * dans le bucket privé `reference-photos/<uid>/…`) et le consentement.
 */
export async function setReferencePhotoAction(formData: FormData) {
  const session = await requireSessionUser("/onboarding/photo");
  const path = String(formData.get("path") ?? "");
  const consent = formData.get("consent") === "on";
  const next = safeNext(String(formData.get("next") ?? ""));

  if (!path.startsWith(`${session.id}/`)) {
    redirect(`/onboarding/photo?erreur=chemin&next=${encodeURIComponent(next)}`);
  }
  if (!consent) {
    redirect(`/onboarding/photo?erreur=consentement&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ reference_photo_path: path, photo_consent_at: new Date().toISOString() })
    .eq("id", session.id);
  if (error) {
    console.error("setReferencePhoto :", error);
    redirect(`/onboarding/photo?erreur=enregistrement&next=${encodeURIComponent(next)}`);
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function markOnboardingSeenAction() {
  const session = await requireSessionUser("/dressing");
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ onboarding_seen: true }).eq("id", session.id);
  revalidatePath("/dressing");
}
