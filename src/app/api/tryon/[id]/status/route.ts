import { NextResponse } from "next/server";
import { after } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserTryOnById } from "@/lib/tryon/queries";
import { processTryOn } from "@/lib/tryon/process";

// La génération relancée ici tourne dans `after()` : il lui faut la même durée
// que les pages qui lancent un essayage.
export const maxDuration = 120;

const STALE_MESSAGE = "La génération a été interrompue. Réessayez.";
// Au-delà de maxDuration, la fonction qui traitait l'essayage n'existe plus.
const STALE_PROCESSING_MS = (maxDuration + 30) * 1000;

/**
 * Statut d'un essayage (interrogé par l'écran de génération).
 * Filets de sécurité :
 * - resté en `queued` (tâche de fond perdue) : on relance le traitement ;
 * - bloqué en `processing` (fonction coupée en cours de route) : échec + remboursement.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/tryon/[id]/status">) {
  const { id } = await ctx.params;
  const tryon = await getUserTryOnById(id);
  if (!tryon) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let { status, error } = tryon;
  const now = Date.now();

  if (status === "queued" && now - new Date(tryon.created_at).getTime() > 5_000) {
    after(() => processTryOn(tryon.id));
  } else if (status === "processing") {
    const startedAt = new Date(tryon.started_at ?? tryon.created_at).getTime();
    if (now - startedAt > STALE_PROCESSING_MS) {
      const { error: failError } = await createSupabaseAdminClient().rpc("fail_tryon", {
        p_tryon_id: tryon.id,
        p_error: STALE_MESSAGE,
      });
      if (failError) console.error(`[tryon ${tryon.id}] fail_tryon :`, failError);
      else {
        status = "failed";
        error = STALE_MESSAGE;
      }
    }
  }

  return NextResponse.json({ status, error }, { headers: { "Cache-Control": "no-store" } });
}
