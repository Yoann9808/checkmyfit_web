import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/catalog/product-card";
import { getHomeProducts } from "@/lib/catalog/queries";
import { getUserTryOnIds } from "@/lib/tryon/queries";

export default async function HomePage() {
  const [{ newest, popular }, tryOnIds] = await Promise.all([getHomeProducts(), getUserTryOnIds()]);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-8 pb-14 sm:px-5 md:grid-cols-2 md:gap-10 md:pt-12">
        <div>
          <Badge tone="ia">Essai IA disponible</Badge>
          <h1 className="mt-4 font-display text-4xl leading-tight text-palissandre sm:text-5xl md:text-6xl">
            Achetez juste, <span className="italic">sans deviner</span>.
          </h1>
          <p className="mt-4 max-w-md font-body text-sm text-wenge">
            Uploadez une photo, et Checkmyfit vous montre exactement ce que chaque pièce donne
            sur vous. Avant l&apos;achat, pas après.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/essayage">Essayer sur moi</ButtonLink>
            <ButtonLink href="/catalogue" variant="secondary">
              Voir le catalogue
            </ButtonLink>
          </div>
          <p className="mt-4 font-body text-[11px] text-noyer">20 essayages offerts à l&apos;inscription.</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-chene-pale md:aspect-[5/4]">
          <Image
            src="/images/hero.webp"
            alt="Essayage virtuel Checkmyfit"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {newest.length > 0 && (
        <HomeSection title="Nouveautés">
          <ProductGrid products={newest} tryOnIds={tryOnIds} />
        </HomeSection>
      )}
      {popular.length > 0 && (
        <HomeSection title="Les plus demandés">
          <ProductGrid products={popular} tryOnIds={tryOnIds} />
        </HomeSection>
      )}
      {newest.length === 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-5">
          <p className="font-body text-sm text-wenge">Le catalogue arrive bientôt.</p>
        </section>
      )}
    </>
  );
}

function HomeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-5">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-3xl text-palissandre">{title}</h2>
        <ButtonLink href="/catalogue" variant="ghost" size="sm">
          Tout voir
        </ButtonLink>
      </div>
      {children}
    </section>
  );
}
