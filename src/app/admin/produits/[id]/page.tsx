import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { ProductThumb } from "@/components/catalog/product-thumb";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/produits/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const admin = createSupabaseAdminClient();
  const { data: product } = await admin.from("products").select("*").eq("id", id).maybeSingle();
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="w-16">
          <ProductThumb name={product.name} category={product.category} imagePath={product.image_path} sizes="64px" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-palissandre">{product.name}</h1>
          <Link href={`/produit/${product.slug}`} className="font-body text-xs text-terracotta underline underline-offset-2" target="_blank">
            Voir la fiche publique
          </Link>
        </div>
      </div>
      <ProductForm product={product} saved={sp.ok === "1"} />
    </div>
  );
}
