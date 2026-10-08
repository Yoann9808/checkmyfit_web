import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FilterBar } from "@/components/catalog/filter-bar";
import { TryOnPicker } from "@/components/tryon/tryon-picker";
import { SilhouetteIcon } from "@/components/ui/garment-icons";
import { ButtonLink } from "@/components/ui/button";
import { getFacets, listProducts, parseFilters } from "@/lib/catalog/queries";
import { getSessionUser } from "@/lib/auth/session";
import { getSignedUrl } from "@/lib/storage/signed-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Essayage virtuel" };

// L'essayage lance la génération en tâche de fond (`after`) depuis cette page
export const maxDuration = 120;

export default async function TryOnPage({ searchParams }: PageProps<"/essayage">) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [session, products, facets] = await Promise.all([getSessionUser(), listProducts(filters), getFacets()]);

  const photoUrl = await getSignedUrl("reference-photos", session?.profile.reference_photo_path);

  // Essayages existants (pour "déjà généré")
  let tryons: Record<string, { id: string; status: string }> = {};
  if (session) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("tryons").select("id, product_id, status").eq("user_id", session.id);
    tryons = Object.fromEntries((data ?? []).map((t) => [t.product_id, { id: t.id, status: t.status }]));
  }

  const photoPanel = (
    <div className="flex items-center gap-4 md:flex-col md:items-stretch">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-chene-pale md:h-auto md:w-full md:flex-1 md:min-h-96">
        {photoUrl ? (
          <Image src={photoUrl} alt="Votre photo de référence" fill unoptimized className="object-cover" />
        ) : (
          <SilhouetteIcon className="m-auto h-16 w-10 text-noyer md:h-40 md:w-24" />
        )}
      </div>
      <div className="min-w-0 md:mt-3">
        <p className="label text-wenge">Votre photo de référence</p>
        {session ? (
          <Link
            href="/onboarding/photo?next=/essayage"
            className="font-body text-[11px] uppercase text-terracotta underline underline-offset-2"
          >
            {photoUrl ? "Changer la photo" : "Ajouter ma photo"}
          </Link>
        ) : (
          <p className="font-body text-xs text-noyer">
            <Link href="/inscription?next=/essayage" className="text-terracotta underline underline-offset-2">
              Créez un compte
            </Link>{" "}
            pour ajouter votre photo. 20 crédits offerts.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 pb-32 sm:px-5 sm:py-8 md:pb-28">
      <h1 className="mb-6 font-display text-3xl text-palissandre sm:text-4xl">Essayage virtuel</h1>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8">
        <aside className="md:sticky md:top-24 md:flex md:h-[calc(100vh-140px)] md:flex-col">{photoPanel}</aside>
        <div>
          <Suspense>
            <FilterBar brands={facets.brands} colors={facets.colors} />
          </Suspense>
          {products.length === 0 ? (
            <p className="mt-8 font-body text-sm text-wenge">Rien ici pour ces filtres. Essayez une autre combinaison.</p>
          ) : (
            <TryOnPicker
              products={products.map((p) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                brand: p.brand,
                category: p.category,
                gender: p.gender,
                price: Number(p.price),
                currency: p.currency,
                image_path: p.image_path,
              }))}
              tryons={tryons}
              isLoggedIn={Boolean(session)}
              hasPhoto={Boolean(photoUrl)}
              credits={session?.profile.credits_balance ?? 0}
            />
          )}
          {!session && (
            <div className="mt-8 md:hidden">
              <ButtonLink href="/inscription?next=/essayage" className="w-full">
                Créer un compte
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
