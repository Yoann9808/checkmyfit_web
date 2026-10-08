"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { productInputSchema } from "@/lib/catalog/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { safeInternalPath } from "@/lib/utils";
import { upsertProduct } from "./products";
import { importProductsCsv, type ImportReport } from "./import";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

function revalidateCatalog() {
  revalidatePath("/", "layout");
}

export async function saveProductAction(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Vérifiez les champs signalés.", fieldErrors };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { id } = await upsertProduct(admin, parsed.data);
    revalidateCatalog();
    redirect(`/admin/produits/${id}?ok=1`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err; // redirect()
    return { error: err instanceof Error ? err.message : "Enregistrement impossible." };
  }
}

export async function toggleProductActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  const admin = createSupabaseAdminClient();
  await admin.from("products").update({ is_active: active }).eq("id", id);
  revalidateCatalog();
  redirect(safeInternalPath(formData.get("back"), "/admin/produits"));
}

export type ImportState = { report?: ImportReport; error?: string } | undefined;

export async function importCsvAction(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const session = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choisissez un fichier CSV." };
  // Vercel refuse les requêtes de plus de 4,5 Mo : on reste en dessous
  if (file.size > 4 * 1024 * 1024) return { error: "Fichier trop lourd (4 Mo maximum). Découpez-le en plusieurs imports." };

  const text = await file.text();
  try {
    const report = await importProductsCsv(file.name, text, session.id);
    revalidateCatalog();
    return { report };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Import impossible." };
  }
}
