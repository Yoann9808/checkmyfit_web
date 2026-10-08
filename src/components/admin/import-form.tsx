"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { importCsvAction, type ImportState } from "@/lib/admin/actions";

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importCsvAction, undefined);
  const report = state?.report;

  return (
    <div>
      <form action={action} className="flex flex-col gap-4 rounded-2xl border-2 border-dashed border-noyer bg-chene-pale p-6">
        <input type="file" name="file" accept=".csv,text/csv" required className="font-body text-sm text-palissandre" />
        {state?.error && <p role="alert" className="font-body text-xs text-brique">{state.error}</p>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Import en cours…" : "Importer"}
        </Button>
        {pending && <p className="font-body text-xs text-wenge">Téléchargement des images, cela peut prendre quelques minutes.</p>}
      </form>

      {report && (
        <div className="mt-8">
          <h2 className="font-display text-2xl text-palissandre">Rapport : {report.filename}</h2>
          <p className="mt-2 font-body text-sm text-wenge">
            {report.ok} produit{report.ok > 1 ? "s" : ""} importé{report.ok > 1 ? "s" : ""} sur {report.total} ligne{report.total > 1 ? "s" : ""}.
            {report.errors.length > 0 && <span className="text-brique"> {report.errors.length} erreur{report.errors.length > 1 ? "s" : ""}.</span>}
          </p>
          {report.errors.length > 0 && (
            <table className="mt-4 w-full font-body text-xs">
              <thead>
                <tr className="text-left text-wenge">
                  <th className="py-2 pr-4">Ligne</th>
                  <th className="py-2 pr-4">Identifiant</th>
                  <th className="py-2">Erreur</th>
                </tr>
              </thead>
              <tbody>
                {report.errors.map((e, i) => (
                  <tr key={i} className="border-t border-chene-dore text-palissandre">
                    <td className="py-2 pr-4">{e.line}</td>
                    <td className="py-2 pr-4">{e.external_id || "—"}</td>
                    <td className="py-2 text-brique">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
