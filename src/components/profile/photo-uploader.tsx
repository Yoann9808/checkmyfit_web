"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SilhouetteIcon } from "@/components/ui/garment-icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setReferencePhotoAction } from "@/lib/profile/actions";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 1600;

/**
 * Redimensionne en JPEG (max 1600 px) quand le navigateur sait décoder l'image.
 * Sinon renvoie le fichier d'origine.
 */
async function prepareImage(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.9));
    if (blob) return { blob, ext: "jpg", type: "image/jpeg" };
  } catch {
    // Format non décodable (HEIC hors Safari) : on envoie tel quel
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  // Certains navigateurs ne renseignent pas le type MIME des HEIC
  return { blob: file, ext, type: file.type || (ext === "heic" ? "image/heic" : "image/jpeg") };
}

export function PhotoUploader({
  userId,
  currentUrl,
  next,
  initialError,
}: {
  userId: string;
  currentUrl: string | null;
  next: string;
  initialError?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [path, setPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    if (!file.type.startsWith("image/") && !/\.heic$/i.test(file.name)) {
      setError("Choisissez une image (JPG, PNG, WebP ou HEIC).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image trop lourde (10 Mo maximum).");
      return;
    }
    setUploading(true);
    try {
      const prepared = await prepareImage(file);
      const objectPath = `${userId}/reference-${Date.now()}.${prepared.ext}`;
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.storage
        .from("reference-photos")
        .upload(objectPath, prepared.blob, { contentType: prepared.type, upsert: true });
      if (upErr) throw upErr;
      setPreview(URL.createObjectURL(prepared.blob));
      setPath(objectPath);
    } catch (e) {
      console.error(e);
      setError("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={setReferencePhotoAction} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="path" value={path ?? ""} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-chene-pale px-6 py-8 text-center transition-colors",
          dragging ? "border-terracotta" : "border-noyer",
        )}
      >
        {preview ? (
          <div className="relative h-72 w-full max-w-xs">
            <Image src={preview} alt="Aperçu de votre photo" fill unoptimized className="rounded-2xl object-cover" />
          </div>
        ) : (
          <>
            <SilhouetteIcon className="mb-4 h-32 w-20 text-noyer opacity-50" />
            <Upload size={20} className="mb-2 text-wenge" aria-hidden />
            <p className="font-body text-xs text-wenge">Glissez une photo ici, ou</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-4 font-body text-xs uppercase tracking-wide text-terracotta underline underline-offset-2 disabled:opacity-60"
        >
          {uploading ? "Envoi en cours…" : preview ? "Changer la photo" : "Choisir une photo"}
        </button>
      </div>

      <ul className="grid gap-2 font-body text-xs text-wenge sm:grid-cols-3">
        <li className="rounded-xl bg-chene-pale/60 px-3 py-2">De face, tête aux pieds</li>
        <li className="rounded-xl bg-chene-pale/60 px-3 py-2">Bien éclairée, fond simple</li>
        <li className="rounded-xl bg-chene-pale/60 px-3 py-2">Vêtements près du corps</li>
      </ul>

      <label className="flex items-start gap-3 font-body text-xs text-wenge">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-terracotta" />
        <span>
          J&apos;accepte que cette photo soit utilisée uniquement pour générer mes essayages virtuels.
          Je peux la remplacer ou la supprimer à tout moment depuis mon compte.
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-brique/10 px-4 py-3 font-body text-xs text-brique">
          {error}
        </p>
      )}

      <Button type="submit" disabled={!path || uploading} className="w-full">
        Enregistrer ma photo
      </Button>
    </form>
  );
}
