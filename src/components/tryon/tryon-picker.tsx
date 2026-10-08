"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ProductThumb } from "@/components/catalog/product-thumb";
import { Button, buttonClasses } from "@/components/ui/button";
import { startTryOn } from "@/lib/tryon/actions";
import { cn, formatPrice } from "@/lib/utils";

export type PickerProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  gender: string;
  price: number;
  currency: string;
  image_path: string | null;
};

/**
 * Grille sélectionnable + barre d'action fixe en bas.
 * La barre se place au-dessus de la barre d'onglets mobile.
 */
export function TryOnPicker({
  products,
  tryons,
  isLoggedIn,
  hasPhoto,
  credits,
}: {
  products: PickerProduct[];
  tryons: Record<string, { id: string; status: string }>;
  isLoggedIn: boolean;
  hasPhoto: boolean;
  credits: number;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = products.find((p) => p.id === selectedId) ?? null;
  const existing = selected ? tryons[selected.id] : undefined;
  const alreadyGenerated = existing?.status === "succeeded";
  const inProgress = existing?.status === "queued" || existing?.status === "processing";
  const outOfCredits = !alreadyGenerated && !inProgress && credits <= 0;

  function launch() {
    if (!selected) return;
    setError(null);
    if (alreadyGenerated && existing) {
      router.push(`/essayage/resultat/${existing.id}`);
      return;
    }
    if (inProgress && existing) {
      router.push(`/essayage/generation/${existing.id}`);
      return;
    }
    startTransition(async () => {
      const result = await startTryOn(selected.id);
      if (!result.ok) {
        if (result.reason === "not_authenticated") router.push(`/connexion?next=/essayage`);
        else if (result.reason === "no_photo") router.push(`/onboarding/photo?next=/essayage`);
        else if (result.reason === "insufficient_credits") router.push(`/credits?raison=epuise&next=/essayage`);
        else setError(result.message);
        return;
      }
      router.push(
        result.status === "succeeded"
          ? `/essayage/resultat/${result.tryonId}`
          : `/essayage/generation/${result.tryonId}`,
      );
    });
  }

  let subLabel = "Utiliser 1 crédit IA";
  if (!isLoggedIn) subLabel = "Créer un compte pour essayer";
  else if (!hasPhoto) subLabel = "Ajouter ma photo d'abord";
  else if (alreadyGenerated) subLabel = "Déjà généré, gratuit à revoir";
  else if (inProgress) subLabel = "Génération en cours";
  else if (outOfCredits) subLabel = "Crédits IA épuisés";

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {products.map((p) => {
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(isSelected ? null : p.id)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-2xl border-2 bg-argile p-2 text-left transition-colors",
                isSelected ? "border-terracotta" : "border-transparent hover:border-chene-dore",
              )}
            >
              <ProductThumb
                name={p.name}
                category={p.category}
                imagePath={p.image_path}
                hasTryOn={tryons[p.id]?.status === "succeeded"}
                className="mb-2"
                sizes="(min-width: 640px) 20vw, 45vw"
              />
              <p className="label text-noyer">{p.brand}</p>
              <p className="font-display text-sm leading-snug text-palissandre">{p.name}</p>
              <p className="mt-0.5 font-body text-xs text-wenge">{formatPrice(p.price, p.currency)}</p>
            </button>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-chene-dore bg-argile/95 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          {selected ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="label text-noyer">{selected.brand}</p>
                <p className="truncate font-display text-palissandre">{selected.name}</p>
                {error && <p className="font-body text-xs text-brique">{error}</p>}
              </div>
              {!isLoggedIn ? (
                <Link href="/inscription?next=/essayage" className={buttonClasses({ className: "flex-col gap-0.5 !py-2.5" })}>
                  <span className="flex items-center gap-2"><Sparkles size={14} aria-hidden /> Essayage IA</span>
                  <span className="text-[10px] normal-case tracking-normal opacity-85">{subLabel}</span>
                </Link>
              ) : !hasPhoto ? (
                <Link href="/onboarding/photo?next=/essayage" className={buttonClasses({ className: "flex-col gap-0.5 !py-2.5" })}>
                  <span className="flex items-center gap-2"><Sparkles size={14} aria-hidden /> Essayage IA</span>
                  <span className="text-[10px] normal-case tracking-normal opacity-85">{subLabel}</span>
                </Link>
              ) : outOfCredits ? (
                <Link href="/credits?raison=epuise&next=/essayage" className={buttonClasses({ className: "flex-col gap-0.5 !py-2.5" })}>
                  <span className="flex items-center gap-2"><Sparkles size={14} aria-hidden /> Recharger</span>
                  <span className="text-[10px] normal-case tracking-normal opacity-85">{subLabel}</span>
                </Link>
              ) : (
                <Button onClick={launch} disabled={pending} className="flex-col gap-0.5 !py-2.5">
                  <span className="flex items-center gap-2"><Sparkles size={14} aria-hidden /> {pending ? "Lancement…" : "Essayage IA"}</span>
                  <span className="text-[10px] normal-case tracking-normal opacity-85">{subLabel}</span>
                </Button>
              )}
            </>
          ) : (
            <p className="font-body text-xs text-wenge">Sélectionnez un vêtement pour lancer l&apos;essayage.</p>
          )}
        </div>
      </div>
    </>
  );
}
