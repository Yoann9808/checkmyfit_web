import type { Metadata } from "next";
import { Check, DoorOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Look sauvé" };

export default async function SavedPage({ searchParams }: PageProps<"/dressing/sauvegarde">) {
  const params = await searchParams;
  const tryonId = typeof params.tryon === "string" ? params.tryon : null;

  return (
    <section className="mx-auto max-w-md px-4 py-16 text-center sm:px-5 sm:py-20">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-palissandre">
        <Check className="h-7 w-7 text-argile" aria-hidden />
      </div>
      <Badge tone="saved">Look sauvé</Badge>
      <h1 className="mt-4 font-display text-3xl text-palissandre">Direction votre dressing</h1>
      <p className="mt-2 font-body text-sm text-wenge">
        Ce rendu vient d&apos;être ajouté à la catégorie <span className="font-display italic">Futurs achats</span>{" "}
        de votre armoire virtuelle.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <ButtonLink href="/dressing" className="w-full">
          <DoorOpen size={14} aria-hidden /> Mon dressing
        </ButtonLink>
        <ButtonLink href={tryonId ? `/essayage/resultat/${tryonId}` : "/essayage"} variant="secondary" className="w-full">
          Retour
        </ButtonLink>
      </div>
    </section>
  );
}
