import Link from "next/link";
import { ProductThumb } from "./product-thumb";
import { SaveButton } from "./save-button";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/catalog/queries";

export function ProductCard({
  product,
  hasTryOn = false,
  priority = false,
  saved = false,
  isLoggedIn = false,
}: {
  product: Product;
  hasTryOn?: boolean;
  priority?: boolean;
  saved?: boolean;
  isLoggedIn?: boolean;
}) {
  const href = `/produit/${product.slug}`;
  return (
    <article className="flex flex-col">
      <div className="relative mb-3">
        <Link href={href} className="block" tabIndex={-1} aria-hidden>
          <ProductThumb
            name={product.name}
            category={product.category}
            imagePath={product.image_path}
            hasTryOn={hasTryOn}
            priority={priority}
            className="transition-colors hover:bg-chene-dore/60"
          />
        </Link>
        <SaveButton
          productId={product.id}
          initialSaved={saved}
          isLoggedIn={isLoggedIn}
          className="absolute top-2 right-2"
        />
      </div>
      <p className="label text-noyer">{product.brand}</p>
      <h3 className="font-display text-sm leading-snug text-palissandre">
        <Link href={href} className="hover:text-terracotta">
          {product.name}
        </Link>{" "}
        {product.gender !== "Unisexe" && (
          <span className="font-body text-xs italic text-noyer">pour {product.gender}</span>
        )}
      </h3>
      <p className="mt-1 font-body text-sm text-wenge">
        {product.is_on_sale && product.compare_at_price != null && (
          <span className="mr-1.5 text-xs text-noyer line-through">
            {formatPrice(Number(product.compare_at_price), product.currency)}
          </span>
        )}
        <span className={product.is_on_sale ? "text-terracotta" : undefined}>
          {formatPrice(Number(product.price), product.currency)}
        </span>
      </p>
    </article>
  );
}

export function ProductGrid({
  products,
  tryOnIds,
  savedIds,
  isLoggedIn = false,
  emptyMessage = "Rien ici pour ces filtres. Essayez une autre combinaison.",
}: {
  products: Product[];
  tryOnIds?: Set<string>;
  savedIds?: Set<string>;
  isLoggedIn?: boolean;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return <p className="mt-10 font-body text-sm text-wenge">{emptyMessage}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          hasTryOn={tryOnIds?.has(p.id)}
          saved={savedIds?.has(p.id)}
          isLoggedIn={isLoggedIn}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
