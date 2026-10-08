import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_TTL = 60 * 60; // 1 h

/**
 * URL signée pour un objet d'un bucket privé.
 * Passe par le client utilisateur : la RLS garantit qu'on ne signe que ses propres fichiers.
 */
export async function getSignedUrl(
  bucket: "reference-photos" | "tryon-results" | "wardrobe",
  path: string | null | undefined,
  ttl = DEFAULT_TTL,
): Promise<string | null> {
  if (!path) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, ttl);
  return data?.signedUrl ?? null;
}
