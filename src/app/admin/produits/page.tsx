import type { Metadata } from "next";
import Link from "next/link";
import { ProductThumb } from "@/components/catalog/product-thumb";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toggleProductActiveAction } from "@/lib/admin/actions";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Produits" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/produits">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const admin = createSupabaseAdminClient();
  let query = admin.from("products").select("*").order("updated_at", { ascending: false }).limit(200);
  if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,external_id.ilike.%${q}%`);
  const { data: products } = await query;
  const back = q ? `/admin/produits?q=${encodeURIComponent(q)}` : "/admin/produits";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-palissandre">Produits</h1>
        <ButtonLink href="/admin/produits/nouveau" size="sm">Nouveau produit</ButtonLink>
      </div>
      <form className="mb-6 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Rechercher (nom, marque, identifiant)" className="field max-w-md" />
        <Button type="submit" variant="secondary" size="sm">Rechercher</Button>
      </form>

      {(products ?? []).length === 0 ? (
        <p className="font-body text-sm text-wenge">Aucun produit. Importez un CSV ou créez un produit.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {products!.map((p) => (
            <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-chene-pale p-3">
              <div className="w-14 shrink-0">
                <ProductThumb name={p.name} category={p.category} imagePath={p.image_path} sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="label text-noyer">{p.brand} · {p.external_id}</p>
                <Link href={`/admin/produits/${p.id}`} className="block truncate font-display text-sm text-palissandre hover:text-terracotta">
                  {p.name}
                </Link>
                <p className="font-body text-xs text-wenge">
                  {p.category} · {formatPrice(Number(p.price), p.currency)} · {p.merchant}
                </p>
              </div>
              <div className="hidden gap-1 sm:flex">
                {p.is_new && <Badge>Nouveau</Badge>}
                {p.is_popular && <Badge tone="ia">Populaire</Badge>}
              </div>
              <Badge tone={p.is_active ? "saved" : "danger"}>{p.is_active ? "Actif" : "Inactif"}</Badge>
              <form action={toggleProductActiveAction}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="active" value={String(!p.is_active)} />
                <input type="hidden" name="back" value={back} />
                <Button type="submit" variant="secondary" size="sm">
                  {p.is_active ? "Désactiver" : "Activer"}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
