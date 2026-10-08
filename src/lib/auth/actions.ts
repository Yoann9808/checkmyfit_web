"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { safeInternalPath } from "@/lib/utils";

const credentialsSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  next: z.string().optional(),
});

export type AuthState = { error?: string; info?: string } | undefined;

const safeNext = safeInternalPath;

/** Après connexion : onboarding photo si nécessaire, sinon la page demandée. */
async function postLoginRedirect(next: string | undefined): Promise<never> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const target = safeNext(next);
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("reference_photo_path")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.reference_photo_path) {
      redirect(`/onboarding/photo?next=${encodeURIComponent(target)}`);
    }
  }
  redirect(target);
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { email, password, next } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(safeNext(next))}` },
  });
  if (error) return { error: translateAuthError(error.message) };

  if (!data.session) {
    return { info: "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse." };
  }
  return postLoginRedirect(next);
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { email, password, next } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message) };
  return postLoginRedirect(next);
}

export async function signInWithGoogleAction(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect(`/connexion?erreur=google&next=${encodeURIComponent(next)}`);
  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

function translateAuthError(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-mail ou mot de passe incorrect.";
  if (/already registered|already exists/i.test(message)) return "Un compte existe déjà avec cette adresse.";
  if (/rate limit/i.test(message)) return "Trop de tentatives, réessayez dans quelques minutes.";
  if (/password/i.test(message)) return "Mot de passe trop faible (8 caractères minimum).";
  return "Une erreur est survenue. Réessayez.";
}
