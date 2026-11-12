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

const FUTURE = "futurs-achats";
const OWNED = "mes-vetements";
type Tab = typeof FUTURE | typeof OWNED;

const TAB_LABELS: Record<Tab, string> = {
  [FUTURE]: "Futurs achats",
  [OWNED]: "Mes vêtements",
};

const pill = (active: boolean) =>
  cn(
    "rounded-full border border-noyer px-4 py-2 font-body text-xs whitespace-nowrap uppercase tracking-wide",
    active ? "bg-ebene text-argile" : "text-palissandre hover:bg-chene-pale",
  );

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

  const future = all.filter((i) => i.kind === "tryon");
  const owned = all.filter((i) => i.kind === "owned");
  const ownedCategories = Array.from(new Set(owned.map((i) => i.category))).sort((a, b) => a.localeCompare(b, "fr"));

  const tab: Tab = params.onglet === OWNED ? OWNED : FUTURE;
  const requestedCategory = typeof params.categorie === "string" ? params.categorie : null;
  const category = requestedCategory && ownedCategories.includes(requestedCategory) ? requestedCategory : null;
  const visible = tab === FUTURE ? future : category ? owned.filter((i) => i.category === category) : owned;
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

      <nav aria-label="Sections du dressing" className="mb-4 grid grid-cols-2 border-b border-chene-pale">
        {([FUTURE, OWNED] as const).map((t) => {
          const count = t === FUTURE ? future.length : owned.length;
          const active = tab === t;
          return (
            <Link
              key={t}
              href={t === FUTURE ? "/dressing" : `/dressing?onglet=${OWNED}`}
              className={cn(
                "-mb-px flex items-center justify-center gap-2 border-b-2 px-2 py-3 font-body text-xs uppercase tracking-wide transition sm:text-sm",
                active ? "border-terracotta text-ebene" : "border-transparent text-wenge hover:text-palissandre",
              )}
              aria-current={active ? "page" : undefined}
            >
              {TAB_LABELS[t]}
              <span className={cn("rounded-full px-2 py-0.5 text-[10px]", active ? "bg-ebene text-argile" : "bg-chene-pale text-wenge")}>
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      <p className="mb-6 font-body text-xs text-wenge">
        {tab === FUTURE
          ? "Les pièces que vous avez essayées virtuellement et que vous envisagez d'acheter."
          : "Les vêtements que vous possédez déjà, pour composer vos tenues."}
      </p>

      {tab === OWNED && ownedCategories.length > 1 && (
        <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={`/dressing?onglet=${OWNED}`} className={pill(!category)} aria-current={!category ? "page" : undefined}>
            Tout
          </Link>
          {ownedCategories.map((c) => (
            <Link
              key={c}
              href={`/dressing?onglet=${OWNED}&categorie=${encodeURIComponent(c)}`}
              className={pill(category === c)}
              aria-current={category === c ? "page" : undefined}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

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
            <>Aucun vêtement pour l&apos;instant. Ajoutez vos pièces pour compléter votre dressing.</>
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
