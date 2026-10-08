import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { SilhouetteIcon } from "@/components/ui/garment-icons";
import { ProductThumb } from "@/components/catalog/product-thumb";
import { requireSessionUser } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { getSignedUrl } from "@/lib/storage/signed-url";
import { listUserTryOns } from "@/lib/tryon/queries";
import { plural } from "@/lib/utils";

export const metadata: Metadata = { title: "Mon compte" };

const STATUS_LABEL: Record<string, string> = {
  queued: "En attente",
  processing: "En cours",
  succeeded: "Prêt",
  failed: "Échec, crédit remboursé",
};

export default async function AccountPage() {
  const session = await requireSessionUser("/compte");
  const [photoUrl, tryons] = await Promise.all([
    getSignedUrl("reference-photos", session.profile.reference_photo_path),
    listUserTryOns(),
  ]);
  const credits = session.profile.credits_balance;

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:px-5 sm:py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-palissandre">Mon compte</h1>
          <p className="mt-1 font-body text-sm text-wenge">{session.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary" size="sm">
            Se déconnecter
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center rounded-2xl bg-chene-pale p-6 text-center">
          <div className="relative mb-4 h-48 w-40 overflow-hidden rounded-xl bg-sable-brule">
            {photoUrl ? (
              <Image src={photoUrl} alt="Votre photo de référence" fill unoptimized className="object-cover" />
            ) : (
              <SilhouetteIcon className="m-auto h-36 w-20 text-palissandre" />
            )}
          </div>
          <p className="label mb-1 text-wenge">Photo de référence</p>
          <p className="mb-3 font-body text-xs text-noyer">Utilisée pour générer vos essayages.</p>
          <ButtonLink href="/onboarding/photo?next=/compte" variant="secondary" size="sm">
            {photoUrl ? "Modifier la photo" : "Ajouter ma photo"}
          </ButtonLink>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-chene-pale p-6">
          <div>
            <p className="label mb-1 text-wenge">Crédits IA</p>
            <p className="flex items-center gap-2 font-display text-4xl text-palissandre">
              <Sparkles size={22} className="text-terracotta" aria-hidden /> {credits}
            </p>
            <p className="mt-2 font-body text-xs text-noyer">
              Chaque essayage consomme 1 crédit. En cas d&apos;échec, il est remboursé.
            </p>
          </div>
          <ButtonLink href="/credits" size="sm" className="mt-4 self-start">
            Recharger
          </ButtonLink>
        </div>
      </div>

      <h2 className="mt-12 mb-4 font-display text-3xl text-palissandre">Mes essayages</h2>
      {tryons.length === 0 ? (
        <p className="font-body text-sm text-wenge">
          Aucun essayage pour l&apos;instant.{" "}
          <Link href="/essayage" className="text-terracotta underline underline-offset-2">
            Essayer une pièce
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tryons.map((t) => (
            <li key={t.id} className="flex items-center gap-4 rounded-2xl bg-chene-pale p-3">
              <div className="w-16 shrink-0">
                {t.product && (
                  <ProductThumb name={t.product.name} category={t.product.category} imagePath={t.product.image_path} sizes="64px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="label text-noyer">{t.product?.brand}</p>
                <p className="truncate font-display text-sm text-palissandre">{t.product?.name}</p>
                <p className="font-body text-xs text-wenge">
                  {new Date(t.created_at).toLocaleDateString("fr-FR")} · {plural(t.attempt, "essai")}
                </p>
              </div>
              <Badge tone={t.status === "succeeded" ? "ia" : t.status === "failed" ? "danger" : "default"}>
                {STATUS_LABEL[t.status]}
              </Badge>
              {t.status === "succeeded" && (
                <ButtonLink href={`/essayage/resultat/${t.id}`} variant="secondary" size="sm">
                  Voir
                </ButtonLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
