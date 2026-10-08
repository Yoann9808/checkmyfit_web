import "server-only";

import Papa from "papaparse";
import { productInputSchema } from "@/lib/catalog/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertProduct } from "./products";

export type ImportError = { line: number; external_id: string; message: string };
export type ImportReport = {
  filename: string;
  total: number;
  ok: number;
  errors: ImportError[];
};

const CONCURRENCY = 4;
// Marge sous le `maxDuration` (300 s) de /admin/import : au-delà, la fonction
// serait coupée sans rapport. Les lignes restantes sont signalées, à réimporter.
const IMPORT_BUDGET_MS = 240_000;

/** Normalise les en-têtes : minuscules, sans espaces ni accents. */
function normalizeHeader(h: string) {
  return h
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/** Importe un CSV de produits : validation ligne par ligne, upsert, rapport. */
export async function importProductsCsv(filename: string, csvText: string, adminId: string): Promise<ImportReport> {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });

  const rows = parsed.data;
  const errors: ImportError[] = [];
  let ok = 0;

  // Erreurs de parsing (guillemets, colonnes)
  for (const e of parsed.errors) {
    errors.push({ line: (e.row ?? 0) + 2, external_id: "", message: e.message });
  }

  const admin = createSupabaseAdminClient();

  // Traitement par lots pour limiter les téléchargements d'images simultanés
  const deadline = Date.now() + IMPORT_BUDGET_MS;
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    if (Date.now() > deadline) {
      errors.push({
        line: i + 2,
        external_id: "",
        message: `Temps d'import dépassé : lignes ${i + 2} à ${rows.length + 1} non traitées. Réimportez le fichier pour continuer (les produits déjà importés ne sont pas retéléchargés).`,
      });
      break;
    }
    const batch = rows.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (raw, j) => {
        const line = i + j + 2; // +1 en-tête, +1 index humain
        const result = productInputSchema.safeParse(raw);
        if (!result.success) {
          const issue = result.error.issues[0];
          errors.push({ line, external_id: raw.external_id ?? "", message: `${issue.path.join(".")} : ${issue.message}` });
          return;
        }
        try {
          await upsertProduct(admin, result.data);
          ok += 1;
        } catch (err) {
          errors.push({ line, external_id: result.data.external_id, message: err instanceof Error ? err.message : String(err) });
        }
      }),
    );
  }

  errors.sort((a, b) => a.line - b.line);

  await admin.from("catalog_imports").insert({
    admin_id: adminId,
    filename,
    rows_total: rows.length,
    rows_ok: ok,
    rows_error: errors.length,
    errors: errors.slice(0, 500),
  });

  return { filename, total: rows.length, ok, errors };
}
