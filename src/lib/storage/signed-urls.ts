import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/** URLs signées en lot : retourne une map chemin → URL. */
export async function getSignedUrls(
  bucket: "reference-photos" | "tryon-results" | "wardrobe",
  paths: Array<string | null | undefined>,
  ttl = 3600,
): Promise<Map<string, string>> {
  const clean = Array.from(new Set(paths.filter(Boolean) as string[]));
  const map = new Map<string, string>();
  if (clean.length === 0) return map;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.storage.from(bucket).createSignedUrls(clean, ttl);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }
  return map;
}
