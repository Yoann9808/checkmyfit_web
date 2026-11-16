import { Suspense } from "react";
import type { Metadata } from "next";
import { FilterBar } from "@/components/catalog/filter-bar";
import { ProductGrid } from "@/components/catalog/product-card";
import { getFacets, listProducts, parseFilters } from "@/lib/catalog/queries";
import { getUserTryOnIds } from "@/lib/tryon/queries";
import { getSavedProductIds } from "@/lib/saved/queries";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Catalogue" };

export default async function CataloguePage({ searchParams }: PageProps<"/catalogue">) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [products, facets, tryOnIds, savedIds, session] = await Promise.all([
    listProducts(filters),
    getFacets(),
    getUserTryOnIds(),
    getSavedProductIds(),
    getSessionUser(),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-5">
      <h1 className="mb-6 font-display text-4xl text-palissandre">Le catalogue</h1>
      <div className="mb-8">
        <Suspense>
          <FilterBar facets={facets} />
        </Suspense>
      </div>
      <ProductGrid products={products} tryOnIds={tryOnIds} savedIds={savedIds} isLoggedIn={Boolean(session)} />
    </section>
  );
}
