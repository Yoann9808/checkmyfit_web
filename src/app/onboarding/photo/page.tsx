import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PhotoUploader } from "@/components/profile/photo-uploader";
import { requireSessionUser } from "@/lib/auth/session";
import { getSignedUrl } from "@/lib/storage/signed-url";
import { safeInternalPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Votre photo de référence" };

const ERRORS: Record<string, string> = {
  chemin: "Le fichier envoyé est invalide. Réessayez.",
  consentement: "Merci d'accepter l'utilisation de votre photo pour continuer.",
  enregistrement: "L'enregistrement a échoué. Réessayez.",
};

export default async function OnboardingPhotoPage({ searchParams }: PageProps<"/onboarding/photo">) {
  const params = await searchParams;
  const next = safeInternalPath(params.next, "/essayage");
  const session = await requireSessionUser(`/onboarding/photo?next=${encodeURIComponent(next)}`);
  const currentUrl = await getSignedUrl("reference-photos", session.profile.reference_photo_path);
  const error = typeof params.erreur === "string" ? ERRORS[params.erreur] : undefined;

  return (
    <section className="mx-auto max-w-md px-4 py-10 sm:px-5 sm:py-14">
      <Link
        href={next}
        className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-wide text-wenge hover:text-palissandre"
      >
        <ArrowLeft size={15} aria-hidden /> Retour
      </Link>
      <h1 className="font-display text-4xl text-palissandre">Votre photo de référence</h1>
      <p className="mt-2 mb-8 font-body text-sm text-wenge">
        Une seule photo suffit : elle sert de base à tous vos essayages. Elle reste privée.
      </p>
      <PhotoUploader userId={session.id} currentUrl={currentUrl} next={next} initialError={error} />
    </section>
  );
}
