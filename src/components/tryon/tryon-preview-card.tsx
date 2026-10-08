import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SilhouetteIcon } from "@/components/ui/garment-icons";
import { getUserTryOnById } from "@/lib/tryon/queries";
import { getSignedUrl } from "@/lib/storage/signed-url";

/** Encart "rendu prêt" affiché sur la fiche produit quand l'essayage existe. */
export async function TryOnPreviewCard({ tryonId }: { tryonId: string; productSlug?: string }) {
  const tryon = await getUserTryOnById(tryonId);
  const url = await getSignedUrl("tryon-results", tryon?.result_path);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-terracotta bg-argile p-4">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-sable-brule">
        {url ? (
          <Image src={url} alt="Votre rendu" fill sizes="64px" className="object-cover" unoptimized />
        ) : (
          <SilhouetteIcon className="m-auto h-16 w-10 text-palissandre" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Badge tone="ia">Rendu prêt</Badge>
        <p className="mt-2 font-body text-xs text-wenge">
          Votre essayage est enregistré et reste visible ici.
        </p>
      </div>
      <ButtonLink href={`/essayage/resultat/${tryonId}`} variant="secondary" size="sm">
        Revoir
      </ButtonLink>
    </div>
  );
}
