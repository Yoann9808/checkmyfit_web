import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { productImageUrl } from "@/lib/catalog/images";
import { publicEnv } from "@/lib/env";
import { getTryOnProvider, TryOnProviderError } from "./providers";

const MAX_ATTEMPTS_PER_CALL = 2;

async function downloadPrivate(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  bucket: string,
  path: string,
) {
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) throw new Error(`Téléchargement impossible : ${bucket}/${path}`);
  return { data: Buffer.from(await data.arrayBuffer()), mimeType: data.type || "image/jpeg" };
}

async function downloadProductImage(imagePath: string | null) {
  const url = productImageUrl(imagePath);
  if (!url) throw new Error("Le produit n'a pas d'image");
  const absolute = url.startsWith("/") ? `${publicEnv.siteUrl}${url}` : url;
  const res = await fetch(absolute, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Image produit inaccessible (${res.status})`);
  return {
    data: Buffer.from(await res.arrayBuffer()),
    mimeType: res.headers.get("content-type") ?? "image/jpeg",
  };
}

/**
 * Traite un essayage en attente : génération, stockage, mise à jour du statut.
 * Idempotent : ne fait rien si l'essayage n'est plus en `queued`.
 */
export async function processTryOn(tryonId: string): Promise<void> {
  const admin = createSupabaseAdminClient();

  // Passage atomique queued -> processing (évite un double traitement)
  const { data: tryon } = await admin
    .from("tryons")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", tryonId)
    .eq("status", "queued")
    .select("*, product:products(*), profile:profiles(reference_photo_path)")
    .maybeSingle();
  if (!tryon) return;

  try {
    const product = tryon.product;
    const photoPath = tryon.profile?.reference_photo_path;
    if (!product) throw new Error("Produit introuvable");
    if (!photoPath) throw new Error("Photo de référence manquante");

    const [person, garment] = await Promise.all([
      downloadPrivate(admin, "reference-photos", photoPath),
      downloadProductImage(product.image_path),
    ]);

    const provider = getTryOnProvider();
    let output: Awaited<ReturnType<typeof provider.generate>> | null = null;
    let lastError: unknown;
    for (let i = 0; i < MAX_ATTEMPTS_PER_CALL && !output; i++) {
      try {
        output = await provider.generate({
          person,
          garment,
          garmentInfo: {
            name: product.name,
            category: product.category,
            color: product.color,
            description: product.description,
            gender: product.gender,
          },
        });
      } catch (err) {
        lastError = err;
        if (!(err instanceof TryOnProviderError && err.retryable)) break;
      }
    }
    if (!output) throw lastError ?? new Error("Génération impossible");

    const ext = output.mimeType.includes("png") ? "png" : output.mimeType.includes("webp") ? "webp" : "jpg";
    const resultPath = `${tryon.user_id}/${tryon.id}-${tryon.attempt}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("tryon-results")
      .upload(resultPath, output.data, { contentType: output.mimeType, upsert: true });
    if (uploadError) throw new Error(`Stockage du rendu impossible : ${uploadError.message}`);

    // Uniquement si toujours en cours : un essayage déjà déclaré bloqué (et
    // remboursé) par la route de statut ne doit pas repasser en succès.
    const { error: updateError } = await admin
      .from("tryons")
      .update({
        status: "succeeded",
        provider: provider.name,
        result_path: resultPath,
        error: null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", tryon.id)
      .eq("status", "processing");
    if (updateError) throw new Error(`Enregistrement du rendu impossible : ${updateError.message}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[tryon ${tryon.id}] échec :`, message);
    // Marque en échec + rembourse le crédit (fonction SQL atomique)
    await admin.rpc("fail_tryon", { p_tryon_id: tryon.id, p_error: message.slice(0, 500) });
  }
}
