import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { SilhouetteIcon } from "@/components/ui/garment-icons";
import { ProductThumb } from "@/components/catalog/product-thumb";
import { requireSessionUser } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { deleteAccountAction, deleteReferencePhotoAction } from "@/lib/profile/actions";
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

const MESSAGES: Record<string, { text: string; tone: "ok" | "error" }> = {
  supprimee: { text: "Votre photo a été supprimée de nos serveurs.", tone: "ok" },
  photo: { text: "La suppression de la photo a échoué. Réessayez.", tone: "error" },
  confirmation: { text: "Tapez SUPPRIMER pour confirmer la suppression du compte.", tone: "error" },
  suppression: { text: "La suppression du compte a échoué. Réessayez ou contactez-nous.", tone: "error" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function AccountPage({ searchParams }: PageProps<"/compte">) {
  const params = await searchParams;
  const session = await requireSessionUser("/compte");
  const messageKey = typeof params.photo === "string" ? params.photo : typeof params.erreur === "string" ? params.erreur : null;
  const message = messageKey ? MESSAGES[messageKey] : undefined;
  const consentAt = session.profile.photo_consent_at;
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

      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={
            message.tone === "error"
              ? "mb-6 rounded-xl bg-brique/10 px-4 py-3 font-body text-xs text-brique"
              : "mb-6 rounded-xl bg-chene-pale px-4 py-3 font-body text-xs text-palissandre"
          }
        >
          {message.text}
        </p>
      )}

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
          <p className="mb-3 font-body text-xs text-noyer">Utilisée uniquement pour générer vos essayages.</p>
          {photoUrl && consentAt && (
            <p className="mb-3 flex items-center gap-1.5 font-body text-[11px] text-wenge">
              <ShieldCheck size={13} className="text-terracotta" aria-hidden />
              Consentement donné le {formatDate(consentAt)}
            </p>
          )}
          <ButtonLink href="/onboarding/photo?next=/compte" variant="secondary" size="sm">
            {photoUrl ? "Modifier la photo" : "Ajouter ma photo"}
          </ButtonLink>
          {photoUrl && (
            <form action={deleteReferencePhotoAction} className="mt-3">
              <button type="submit" className="font-body text-[11px] uppercase tracking-wide text-brique underline underline-offset-2">
                Supprimer ma photo
              </button>
              <p className="mt-1 font-body text-[10px] text-noyer">Retire votre consentement. Vos essayages déjà générés restent dans votre dressing.</p>
            </form>
          )}
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

      <div id="supprimer" className="mt-16 scroll-mt-24 rounded-2xl border border-brique/40 p-6">
        <h2 className="font-display text-2xl text-palissandre">Supprimer mon compte</h2>
        <p className="mt-2 font-body text-xs text-wenge">
          Votre photo, vos essayages, votre dressing, vos pièces sauvegardées et vos crédits restants seront effacés
          définitivement. Cette action est irréversible.
        </p>
        <form action={deleteAccountAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="label text-wenge">Tapez SUPPRIMER pour confirmer</span>
            <input name="confirm" required autoComplete="off" className="field" placeholder="SUPPRIMER" />
          </label>
          <Button type="submit" variant="danger" size="sm">
            Supprimer définitivement
          </Button>
        </form>
      </div>
    </section>
  );
}
