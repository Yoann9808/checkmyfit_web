import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DoorOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, buttonClasses } from "@/components/ui/button";
import { requireSessionUser } from "@/lib/auth/session";
import { getProductById } from "@/lib/catalog/queries";
import { productImageUrl } from "@/lib/catalog/images";
import { getSignedUrl } from "@/lib/storage/signed-url";
import { getUserTryOnById } from "@/lib/tryon/queries";
import { saveTryOnToWardrobeAction } from "@/lib/wardrobe/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Votre essayage" };

export default async function ResultPage({ params }: PageProps<"/essayage/resultat/[id]">) {
  const { id } = await params;
  const session = await requireSessionUser(`/essayage/resultat/${id}`);
  const tryon = await getUserTryOnById(id);
  if (!tryon) notFound();
  if (tryon.status !== "succeeded") redirect(`/essayage/generation/${tryon.id}`);

  const supabase = await createSupabaseServerClient();
  const [product, resultUrl, saved] = await Promise.all([
    getProductById(tryon.product_id),
    getSignedUrl("tryon-results", tryon.result_path),
    supabase
      .from("wardrobe_items")
      .select("id")
      .eq("user_id", session.id)
      .eq("tryon_id", tryon.id)
      .maybeSingle()
      .then((r) => Boolean(r.data)),
  ]);
  if (!product) notFound();
  const packshot = productImageUrl(product.image_path);

  return (
    <section className="mx-auto max-w-md px-4 py-8 text-center sm:px-5 sm:py-12">
      <Badge tone="ia">IA</Badge>
      <h1 className="mt-4 font-display text-3xl text-palissandre sm:text-4xl">
        Voici <span className="italic">{product.name.toLowerCase()}</span> sur vous
      </h1>

      <div className="relative mt-6 aspect-[3/4] overflow-hidden rounded-3xl bg-chene-pale">
        {resultUrl ? (
          <Image src={resultUrl} alt={`Vous portant ${product.name}`} fill unoptimized priority className="object-cover" />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center font-body text-sm text-wenge">
            Rendu indisponible
          </p>
        )}
        {packshot && (
          <Link
            href={`/produit/${product.slug}`}
            className="absolute right-4 bottom-4 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta p-2.5 shadow-lg"
            aria-label="Voir la fiche produit"
          >
            <Image src={packshot} alt="" width={40} height={40} className="h-full w-full object-contain" />
          </Link>
        )}
      </div>
      <p className="mt-4 font-body text-xs text-wenge">
        Rendu généré à partir de votre photo. Les tailles et la disponibilité sont à vérifier chez{" "}
        {product.merchant}.
      </p>

      <div className="mt-7 flex flex-col gap-3">
        {saved ? (
          <ButtonLink href="/dressing" variant="dark" className="w-full">
            <DoorOpen size={14} aria-hidden /> Dans votre dressing
          </ButtonLink>
        ) : (
          <form action={saveTryOnToWardrobeAction}>
            <input type="hidden" name="tryonId" value={tryon.id} />
            <Button type="submit" className="w-full">
              Sauver ce look
            </Button>
          </form>
        )}
        <a
          href={`/api/go/${product.id}`}
          target="_blank"
          rel="noopener sponsored"
          className={buttonClasses({ variant: "secondary", className: "w-full" })}
        >
          Acheter chez {product.merchant} <ExternalLink size={13} aria-hidden />
        </a>
        <ButtonLink href={`/produit/${product.slug}`} variant="ghost" size="sm" className="mx-auto">
          Retour à la fiche produit
        </ButtonLink>
      </div>
    </section>
  );
}
