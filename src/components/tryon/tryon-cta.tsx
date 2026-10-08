import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { startTryOnAndRedirect } from "@/lib/tryon/actions";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  productSlug: string;
  isLoggedIn: boolean;
  hasPhoto: boolean;
  generated: boolean;
  credits: number;
  tryonId?: string | null;
  className?: string;
};

/**
 * Bouton "Essayer sur moi" : gère tous les cas (non connecté, sans photo,
 * déjà généré, sans crédit, prêt) avec un sous-libellé explicite.
 */
export function TryOnCta({ productId, productSlug, isLoggedIn, hasPhoto, generated, credits, tryonId, className }: Props) {
  const back = `/produit/${productSlug}`;
  const label = (
    <span className="flex items-center gap-2">
      <Sparkles size={14} aria-hidden /> Essayer sur moi
    </span>
  );
  const stacked = "flex-col gap-0.5 !py-2.5";
  const sub = (text: string) => (
    <span className="text-[10px] normal-case tracking-normal opacity-85">{text}</span>
  );

  if (generated && tryonId) {
    return (
      <Link href={`/essayage/resultat/${tryonId}`} className={cn(buttonClasses({ className: stacked }), className)}>
        {label}
        {sub("Déjà généré, gratuit à revoir")}
      </Link>
    );
  }
  if (!isLoggedIn) {
    return (
      <Link href={`/connexion?next=${encodeURIComponent(back)}`} className={cn(buttonClasses({ className: stacked }), className)}>
        {label}
        {sub("Créer un compte, 20 crédits offerts")}
      </Link>
    );
  }
  if (!hasPhoto) {
    return (
      <Link href={`/onboarding/photo?next=${encodeURIComponent(back)}`} className={cn(buttonClasses({ className: stacked }), className)}>
        {label}
        {sub("Ajouter ma photo de référence")}
      </Link>
    );
  }
  if (credits <= 0) {
    return (
      <Link href={`/credits?raison=epuise&next=${encodeURIComponent(back)}`} className={cn(buttonClasses({ className: stacked }), className)}>
        {label}
        {sub("Crédits IA épuisés, recharger")}
      </Link>
    );
  }
  return (
    <form action={startTryOnAndRedirect} className={cn("flex", className)}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <button type="submit" className={buttonClasses({ className: cn(stacked, "w-full") })}>
        {label}
        {sub("Utiliser 1 crédit IA")}
      </button>
    </form>
  );
}
