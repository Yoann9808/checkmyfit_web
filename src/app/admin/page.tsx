import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminDashboardPage() {
  const admin = createSupabaseAdminClient();
  const [products, users, tryons, clicks, purchases, imports] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("tryons").select("id", { count: "exact", head: true }).eq("status", "succeeded"),
    admin.from("affiliate_clicks").select("id", { count: "exact", head: true }),
    admin.from("credit_transactions").select("delta").eq("reason", "purchase"),
    admin.from("catalog_imports").select("*").order("created_at", { ascending: false }).limit(5),
  ]);
  const creditsSold = (purchases.data ?? []).reduce((s, r) => s + r.delta, 0);

  const stats = [
    ["Produits actifs", products.count ?? 0],
    ["Inscrits", users.count ?? 0],
    ["Essayages réussis", tryons.count ?? 0],
    ["Clics affiliés", clicks.count ?? 0],
    ["Crédits vendus", creditsSold],
  ] as const;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-palissandre">Tableau de bord</h1>
        <div className="flex gap-2">
          <ButtonLink href="/admin/import" size="sm">Importer un CSV</ButtonLink>
          <ButtonLink href="/admin/produits/nouveau" variant="secondary" size="sm">Nouveau produit</ButtonLink>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-chene-pale p-5">
            <dt className="label text-wenge">{label}</dt>
            <dd className="mt-2 font-display text-3xl text-palissandre">{value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 mb-4 font-display text-2xl text-palissandre">Derniers imports</h2>
      {(imports.data ?? []).length === 0 ? (
        <p className="font-body text-sm text-wenge">Aucun import pour l&apos;instant.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {imports.data!.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-chene-pale px-4 py-3 font-body text-xs">
              <span className="text-palissandre">{i.filename}</span>
              <span className="text-wenge">
                {new Date(i.created_at).toLocaleString("fr-FR")} · {i.rows_ok}/{i.rows_total} ok
                {i.rows_error > 0 && <span className="text-brique"> · {i.rows_error} erreurs</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
