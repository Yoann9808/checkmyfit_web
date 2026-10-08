import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GenerationProgress } from "@/components/tryon/generation-progress";
import { requireSessionUser } from "@/lib/auth/session";
import { getProductById } from "@/lib/catalog/queries";
import { getSignedUrl } from "@/lib/storage/signed-url";
import { getUserTryOnById } from "@/lib/tryon/queries";
import { productImageUrl } from "@/lib/catalog/images";

export const metadata: Metadata = { title: "Génération en cours" };

export default async function GenerationPage({ params }: PageProps<"/essayage/generation/[id]">) {
  const { id } = await params;
  const session = await requireSessionUser(`/essayage/generation/${id}`);
  const tryon = await getUserTryOnById(id);
  if (!tryon) notFound();
  if (tryon.status === "succeeded") redirect(`/essayage/resultat/${tryon.id}`);

  const [product, photoUrl] = await Promise.all([
    getProductById(tryon.product_id),
    getSignedUrl("reference-photos", session.profile.reference_photo_path),
  ]);

  return (
    <GenerationProgress
      tryonId={tryon.id}
      initialStatus={tryon.status}
      initialError={tryon.error}
      photoUrl={photoUrl}
      productImageUrl={productImageUrl(product?.image_path)}
      productSlug={product?.slug ?? null}
      productName={product?.name ?? "ce vêtement"}
    />
  );
}
