"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalog/taxonomy";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addOwnedItemAction } from "@/lib/wardrobe/actions";

const MAX_BYTES = 10 * 1024 * 1024;

export function AddOwnedItemDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Choisissez une image.");
    if (file.size > MAX_BYTES) return setError("Image trop lourde (10 Mo maximum).");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const objectPath = `${userId}/${Date.now()}.${ext}`;
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.storage.from("wardrobe").upload(objectPath, file, { contentType: file.type });
      if (upErr) throw upErr;
      setPreview(URL.createObjectURL(file));
      setPath(objectPath);
    } catch {
      setError("L'envoi a échoué. Réessayez.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + Ajouter un vêtement
      </Button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ebene/70 sm:items-center sm:px-5" role="dialog" aria-modal="true" aria-labelledby="add-item-title">
          <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-argile p-6 sm:max-w-sm sm:rounded-3xl sm:p-7">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-5 right-5 text-wenge" aria-label="Fermer">
              <X size={18} aria-hidden />
            </button>
            <h2 id="add-item-title" className="mb-4 font-display text-2xl text-palissandre">
              Ajouter un vêtement
            </h2>

            <form action={addOwnedItemAction} className="flex flex-col gap-3">
              <input type="hidden" name="path" value={path ?? ""} />
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-noyer bg-chene-pale py-6">
                {preview ? (
                  <Image src={preview} alt="" width={160} height={160} unoptimized className="max-h-32 w-auto rounded-xl object-cover" />
                ) : (
                  <Upload size={20} className="text-wenge" aria-hidden />
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="mt-3 font-body text-xs uppercase tracking-wide text-terracotta underline underline-offset-2"
                >
                  {uploading ? "Envoi…" : preview ? "Changer la photo" : "Choisir une photo"}
                </button>
              </div>
              <input name="brand" placeholder="Marque" className="field" maxLength={80} />
              <select name="category" className="field" defaultValue={CATEGORIES[0]} aria-label="Catégorie">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input name="color" placeholder="Couleur" className="field" maxLength={60} />
              {error && <p className="font-body text-xs text-brique">{error}</p>}
              <Button type="submit" disabled={!path || uploading} className="mt-1 w-full">
                Ajouter à mon dressing
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
