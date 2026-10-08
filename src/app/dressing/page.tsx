import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { FamilyIcon } from "@/components/ui/garment-icons";
import { AddOwnedItemDialog } from "@/components/wardrobe/add-owned-item-dialog";
import { WardrobeOnboarding } from "@/components/wardrobe/wardrobe-onboarding";
import { requireSessionUser } from "@/lib/auth/session";
import { getSignedUrls } from "@/lib/storage/signed-urls";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteWardrobeItemAction } from "@/lib/wardrobe/actions";
import { cn, plural } from "@/lib/utils";

export const metadata: Metadata = { title: "Mon dressing" };

const FUTURE = "Futurs achats";

export default async function WardrobePage({ searchParams }: PageProps<"/dressing">) {
  const params = await searchParams;
  const session = await requireSessionUser("/dressing");
  const supabase = await createSupabaseServerClient();

  const { data: items } = await supabase
    .from("wardrobe_items")
    .select("*, tryon:tryons(id, product:products(id, slug, name, brand))")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });
  const all = items ?? [];

  const [tryonUrls, ownedUrls] = await Promise.all([
    getSignedUrls("tryon-results", all.filter((i) => i.kind === "tryon").map((i) => i.photo_path)),
    getSignedUrls("wardrobe", all.filter((i) => i.kind === "owned").map((i) => i.photo_path)),
  ]);

  const ownedCategories = Array.from(new Set(all.filter((i) => i.kind === "owned").map((i) => i.category)));
  const tabs = [FUTURE, ...ownedCategories];
  const requested = typeof params.onglet === "string" ? params.onglet : FUTURE;
  const tab = tabs.includes(requested) ? requested : FUTURE;
  const visible = tab === FUTURE ? all.filter((i) => i.kind === "tryon") : all.filter((i) => i.kind === "owned" && i.category === tab);
  const error = typeof params.erreur === "string" ? "L'ajout a échoué. Réessayez." : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      {!session.profile.onboarding_seen && <WardrobeOnboarding />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ebene sm:text-4xl">Mon dressing</h1>
          <p className="mt-1 font-body text-xs text-wenge">{plural(all.length, "look sauvegardé", "looks sauvegardés")}</p>
        </div>
        <AddOwnedItemDialog userId={session.id} />
      </div>

      {error && <p className="mb-4 rounded-xl bg-brique/10 px-4 py-3 font-body text-xs text-brique">{error}</p>}

      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((t) => (
          <Link
            key={t}
            href={t === FUTURE ? "/dressing" : `/dressing?onglet=${encodeURIComponent(t)}`}
            className={cn(
              "rounded-full border border-noyer px-4 py-2 font-body text-xs whitespace-nowrap uppercase tracking-wide",
              tab === t ? "bg-ebene text-argile" : "text-palissandre hover:bg-chene-pale",
            )}
            aria-current={tab === t ? "page" : undefined}
          >
            {t}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="font-body text-sm text-wenge">
          {tab === FUTURE ? (
            <>
              Aucun essayage sauvé pour l&apos;instant.{" "}
              <Link href="/essayage" className="text-terracotta underline underline-offset-2">
                Essayez une pièce sur vous
              </Link>
              .
            </>
          ) : (
            <>Rien dans « {tab} ». Ajoutez un de vos vêtements pour compléter votre dressing.</>
          )}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {visible.map((item) => {
            const url = item.kind === "tryon" ? tryonUrls.get(item.photo_path ?? "") : ownedUrls.get(item.photo_path ?? "");
            const product = item.tryon?.product ?? null;
            return (
              <li key={item.id} className="group flex flex-col">
                <div className={cn("relative mb-3 aspect-[3/4] overflow-hidden rounded-2xl", item.kind === "tryon" ? "bg-chene-pale" : "bg-sable-brule")}>
                  {url ? (
                    <Image src={url} alt="" fill unoptimized sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  ) : (
                    <FamilyIcon category={item.category} className="m-auto h-14 w-14 text-palissandre" />
                  )}
                  {item.kind === "tryon" && (
                    <div className="absolute top-3 left-3">
                      <Badge tone="ia">IA</Badge>
                    </div>
                  )}
                  <form action={deleteWardrobeItemAction} className="absolute top-2 right-2">
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-full bg-argile/90 p-2 text-wenge opacity-80 transition hover:text-brique sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                      aria-label="Retirer du dressing"
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </form>
                </div>
                <p className="label text-noyer">{item.brand ?? "Marque non précisée"}</p>
                <p className="font-display text-sm text-palissandre">{product?.name ?? item.category}</p>
                {item.kind === "tryon" && product ? (
                  <div className="mt-1 flex gap-3">
                    <Link href={`/essayage/resultat/${item.tryon_id}`} className="font-body text-[10px] uppercase text-terracotta underline underline-offset-2">
                      Revoir
                    </Link>
                    <Link href={`/produit/${product.slug}`} className="font-body text-[10px] uppercase text-terracotta underline underline-offset-2">
                      Voir le produit
                    </Link>
                  </div>
                ) : (
                  <p className="font-body text-xs text-wenge">{item.color ?? ""}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {all.length === 0 && (
        <div className="mt-10">
          <ButtonLink href="/essayage">Essayer une pièce</ButtonLink>
        </div>
      )}
    </section>
  );
}
