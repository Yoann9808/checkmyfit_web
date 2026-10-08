import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ProductThumb } from "@/components/catalog/product-thumb";
import { TryOnCta } from "@/components/tryon/tryon-cta";
import { TryOnPreviewCard } from "@/components/tryon/tryon-preview-card";
import { buttonClasses } from "@/components/ui/button";
import { getProductBySlug } from "@/lib/catalog/queries";
import { defaultSizesFor } from "@/lib/catalog/taxonomy";
import { productImageUrl } from "@/lib/catalog/images";
import { getSessionUser } from "@/lib/auth/session";
import { getUserTryOnForProduct } from "@/lib/tryon/queries";
import { formatPrice } from "@/lib/utils";

// "Essayer sur moi" lance la génération en tâche de fond (`after`) depuis cette page
export const maxDuration = 120;

export async function generateMetadata({ params }: PageProps<"/produit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  const image = productImageUrl(product.image_path);
  return {
    title: `${product.name} · ${product.brand}`,
    description: product.description ?? undefined,
    openGraph: image ? { images: [image] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/produit/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [session, tryon] = await Promise.all([getSessionUser(), getUserTryOnForProduct(product.id)]);
  const sizes = product.sizes.length ? product.sizes : defaultSizesFor(product.category);
  const generated = tryon?.status === "succeeded";
  const credits = session?.profile.credits_balance ?? 0;

  const details = [
    ["Description", product.description],
    ["Conseils d'entretien", product.care],
    ["Lieu de fabrication", product.made_in],
    ["Conseils de taille", product.size_advice],
  ].filter(([, v]) => v) as Array<[string, string]>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <Link
        href="/catalogue"
        className="mb-6 flex items-center gap-2 font-body text-xs uppercase tracking-wide text-wenge hover:text-palissandre"
      >
        <ArrowLeft size={15} aria-hidden /> Retour au catalogue
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <ProductThumb
            name={product.name}
            category={product.category}
            imagePath={product.image_path}
            hasTryOn={generated}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="mx-auto max-w-sm md:max-w-none"
          />
          {generated && tryon && (
            <div className="mt-4">
              <TryOnPreviewCard tryonId={tryon.id} productSlug={product.slug} />
            </div>
          )}
        </div>

        <div>
          <p className="label text-noyer">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl text-palissandre sm:text-4xl">{product.name}</h1>
          {product.color && (
            <p className="mt-2 font-display text-sm italic text-terracotta">
              {product.color} · pour {product.gender === "Unisexe" ? "tous" : product.gender}
            </p>
          )}
          <p className="mt-4 font-body text-xl text-wenge">
            {formatPrice(Number(product.price), product.currency)}
          </p>

          <div className="mt-6">
            <p className="label mb-2 text-wenge">Tailles disponibles chez {product.merchant}</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-noyer px-3.5 py-2 font-body text-xs text-palissandre"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TryOnCta
              productId={product.id}
              productSlug={product.slug}
              isLoggedIn={Boolean(session)}
              hasPhoto={Boolean(session?.profile.reference_photo_path)}
              generated={generated}
              credits={credits}
              className="flex-1"
            />
            <a
              href={`/api/go/${product.id}`}
              target="_blank"
              rel="noopener sponsored"
              className={buttonClasses({ variant: "secondary", className: "flex-1" })}
            >
              Acheter chez {product.merchant} <ExternalLink size={13} aria-hidden />
            </a>
          </div>
          <p className="mt-3 font-body text-[11px] text-noyer">
            {session
              ? session.profile.reference_photo_path
                ? "Votre photo de référence est prête : l'essayage prend une vingtaine de secondes."
                : "Ajoutez votre photo de référence pour débloquer l'essayage virtuel."
              : "Créez un compte pour débloquer l'essayage virtuel, 20 crédits offerts."}
          </p>
        </div>
      </div>

      {details.length > 0 && (
        <div className="mt-12 grid gap-x-10 gap-y-6 border-t border-chene-dore pt-8 md:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <p className="label mb-1 text-wenge">{label}</p>
              <p className="font-body text-sm text-palissandre">{value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
