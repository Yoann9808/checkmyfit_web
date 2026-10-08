import type { Metadata } from "next";
import { ImportForm } from "@/components/admin/import-form";
import { CSV_COLUMNS } from "@/lib/catalog/schema";

export const metadata: Metadata = { title: "Import CSV" };

// L'import télécharge les images une à une : durée maximale d'une fonction Vercel.
// Garder IMPORT_BUDGET_MS (lib/admin/import.ts) en dessous.
export const maxDuration = 300;

export default function AdminImportPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-display text-3xl text-palissandre">Import du catalogue</h1>
      <p className="mb-6 font-body text-sm text-wenge">
        Un fichier CSV (UTF-8, séparateur virgule) avec une ligne par produit. La colonne{" "}
        <code className="rounded bg-chene-pale px-1">external_id</code> sert de clé : réimporter un identifiant existant
        met le produit à jour. Les images sont téléchargées depuis <code className="rounded bg-chene-pale px-1">image_url</code>{" "}
        et stockées chez nous.
      </p>
      <details className="mb-6 rounded-2xl bg-chene-pale p-4 font-body text-xs text-palissandre">
        <summary className="cursor-pointer font-medium">Colonnes attendues</summary>
        <p className="mt-3 break-words">{CSV_COLUMNS.join(", ")}</p>
        <p className="mt-2 text-wenge">
          Obligatoires : external_id, name, brand, category, price, merchant, affiliate_url. Tailles séparées par « | ».
          Booléens : true / false.{" "}
          <a href="/admin/import/template.csv" className="text-terracotta underline underline-offset-2">
            Télécharger le modèle
          </a>
        </p>
      </details>
      <ImportForm />
    </div>
  );
}
