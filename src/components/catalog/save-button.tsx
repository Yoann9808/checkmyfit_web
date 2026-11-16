"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { setProductSavedAction } from "@/lib/saved/actions";
import { cn } from "@/lib/utils";

/**
 * Cœur « sauvegarder ». Mise à jour optimiste ; sans compte, renvoie vers la connexion.
 * `variant="overlay"` : pastille ronde posée sur une vignette.
 */
export function SaveButton({
  productId,
  initialSaved,
  isLoggedIn,
  variant = "overlay",
  className,
}: {
  productId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useOptimistic(initialSaved);
  const [, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push(`/connexion?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const next = !saved;
    startTransition(async () => {
      setSaved(next);
      const res = await setProductSavedAction(productId, next);
      if (res.ok) router.refresh();
    });
  }

  const label = saved ? "Retirer des pièces sauvegardées" : "Sauvegarder cette pièce";
  const icon = <Heart size={variant === "overlay" ? 15 : 14} className={saved ? "fill-terracotta text-terracotta" : ""} aria-hidden />;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-noyer px-4 py-2 font-body text-[11px] uppercase tracking-wide text-palissandre transition-colors hover:bg-chene-pale",
          className,
        )}
      >
        {icon}
        {saved ? "Sauvegardé" : "Sauvegarder"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-full bg-argile/90 p-2 text-wenge shadow-sm transition-colors hover:text-terracotta",
        className,
      )}
    >
      {icon}
    </button>
  );
}
