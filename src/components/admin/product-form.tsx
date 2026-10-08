"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, GENDERS } from "@/lib/catalog/taxonomy";
import { saveProductAction, type ProductFormState } from "@/lib/admin/actions";
import type { Tables } from "@/lib/supabase/database.types";

type Product = Tables<"products">;

function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={name}>
      <span className="label text-wenge">{label}</span>
      {children}
      {error && <span className="font-body text-xs text-brique">{error}</span>}
    </label>
  );
}

export function ProductForm({ product, saved }: { product?: Product | null; saved?: boolean }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProductAction, undefined);
  const e = state?.fieldErrors ?? {};
  const p = product;

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      {saved && !state && (
        <p className="rounded-xl bg-chene-pale px-4 py-3 font-body text-xs text-palissandre md:col-span-2">Produit enregistré.</p>
      )}
      {state?.error && (
        <p role="alert" className="rounded-xl bg-brique/10 px-4 py-3 font-body text-xs text-brique md:col-span-2">{state.error}</p>
      )}

      <Field name="external_id" label="Identifiant externe (SKU)" error={e.external_id}>
        <input id="external_id" name="external_id" defaultValue={p?.external_id} required readOnly={Boolean(p)} className="field read-only:opacity-60" />
      </Field>
      <Field name="merchant" label="Marchand" error={e.merchant}>
        <input id="merchant" name="merchant" defaultValue={p?.merchant} required className="field" />
      </Field>
      <Field name="name" label="Nom" error={e.name}>
        <input id="name" name="name" defaultValue={p?.name} required className="field" />
      </Field>
      <Field name="brand" label="Marque" error={e.brand}>
        <input id="brand" name="brand" defaultValue={p?.brand} required className="field" />
      </Field>
      <Field name="category" label="Catégorie" error={e.category}>
        <select id="category" name="category" defaultValue={p?.category ?? CATEGORIES[0]} className="field">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field name="gender" label="Genre" error={e.gender}>
        <select id="gender" name="gender" defaultValue={p?.gender ?? "Unisexe"} className="field">
          {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </Field>
      <Field name="price" label="Prix" error={e.price}>
        <input id="price" name="price" type="number" step="0.01" min="0" defaultValue={p ? Number(p.price) : ""} required className="field" />
      </Field>
      <Field name="currency" label="Devise" error={e.currency}>
        <input id="currency" name="currency" defaultValue={p?.currency ?? "EUR"} className="field" />
      </Field>
      <Field name="color" label="Couleur" error={e.color}>
        <input id="color" name="color" defaultValue={p?.color ?? ""} className="field" />
      </Field>
      <Field name="sizes" label="Tailles (séparées par |)" error={e.sizes}>
        <input id="sizes" name="sizes" defaultValue={p?.sizes.join("|") ?? ""} placeholder="XS|S|M|L|XL" className="field" />
      </Field>
      <Field name="affiliate_url" label="Lien affilié" error={e.affiliate_url}>
        <input id="affiliate_url" name="affiliate_url" type="url" defaultValue={p?.affiliate_url} required className="field" />
      </Field>
      <Field name="image_url" label="URL de l'image (téléchargée et stockée)" error={e.image_url}>
        <input id="image_url" name="image_url" type="url" defaultValue={p?.image_source_url ?? ""} className="field" />
      </Field>
      <div className="md:col-span-2">
        <Field name="description" label="Description" error={e.description}>
          <textarea id="description" name="description" defaultValue={p?.description ?? ""} rows={3} className="field" />
        </Field>
      </div>
      <Field name="care" label="Conseils d'entretien" error={e.care}>
        <textarea id="care" name="care" defaultValue={p?.care ?? ""} rows={2} className="field" />
      </Field>
      <Field name="size_advice" label="Conseils de taille" error={e.size_advice}>
        <textarea id="size_advice" name="size_advice" defaultValue={p?.size_advice ?? ""} rows={2} className="field" />
      </Field>
      <Field name="made_in" label="Lieu de fabrication" error={e.made_in}>
        <input id="made_in" name="made_in" defaultValue={p?.made_in ?? ""} className="field" />
      </Field>
      <div className="flex flex-wrap gap-6 self-end font-body text-xs text-palissandre">
        <label className="flex items-center gap-2"><input type="checkbox" name="is_new" defaultChecked={p?.is_new ?? true} className="accent-terracotta" /> Nouveauté</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_popular" defaultChecked={p?.is_popular ?? false} className="accent-terracotta" /> Populaire</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={p?.is_active ?? true} className="accent-terracotta" /> Actif</label>
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
      </div>
    </form>
  );
}
