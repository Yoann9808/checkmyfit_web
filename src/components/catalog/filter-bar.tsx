"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bookmark, BookmarkCheck, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { FILTER_PARAMS, PROMOS, type Facets, type FilterKey } from "@/lib/catalog/filters";
import { colorFamily } from "@/lib/catalog/colors";
import { pieceTypeOf } from "@/lib/catalog/taxonomy";
import { cn } from "@/lib/utils";

const LABELS: Record<FilterKey, string> = {
  gender: "Genre",
  pieceType: "Type de pièce",
  category: "Catégorie",
  priceMin: "Prix",
  priceMax: "Prix",
  brand: "Marque",
  size: "Taille",
  color: "Couleur",
  material: "Matière",
  pattern: "Motif",
  promo: "Promotion",
};

/** Filtres rangés dans « Plus de filtres ». */
const MORE_KEYS = ["size", "material", "pattern", "promo"] as const;
const SAVED_KEY = "cmf_saved_filters";
const FILTER_PARAM_NAMES = new Set<string>([...Object.values(FILTER_PARAMS), "prix"]);

type Option = { value: string; label: string };
type MenuKey = "gender" | "pieceType" | "category" | "price" | "brand" | "color";

const triggerClasses = (active: boolean) =>
  cn(
    "flex items-center gap-1.5 rounded-full border px-4 py-2 font-body text-[11px] whitespace-nowrap uppercase tracking-wide text-palissandre",
    active ? "border-terracotta bg-chene-pale" : "border-noyer",
  );

const chipClasses = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1.5 font-body text-xs transition-colors",
    active ? "border-terracotta bg-terracotta text-argile" : "border-noyer text-palissandre hover:bg-chene-pale",
  );

const panelClasses = "absolute z-30 mt-2 rounded-2xl border border-chene-dore bg-argile shadow-lg";

const toOptions = (values: readonly string[]): Option[] => values.map((v) => ({ value: v, label: v }));

/** Ne garde que les paramètres de filtre (ignore `q`, `onglet`, etc.), triés pour comparaison. */
function filterQuery(params: URLSearchParams) {
  const kept = new URLSearchParams();
  [...params.entries()]
    .filter(([k]) => FILTER_PARAM_NAMES.has(k))
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([k, v]) => kept.append(k, v));
  return kept.toString();
}

function readSaved(): string | null {
  try {
    return localStorage.getItem(SAVED_KEY);
  } catch {
    return null;
  }
}

function ListMenu({
  options,
  value,
  onSelect,
  searchable = false,
}: {
  options: Option[];
  value: string | null;
  onSelect: (v: string | null) => void;
  searchable?: boolean;
}) {
  const [term, setTerm] = useState("");
  const visible = term
    ? options.filter((o) => o.label.toLocaleLowerCase("fr").includes(term.toLocaleLowerCase("fr")))
    : options;
  return (
    <div className={cn(panelClasses, "min-w-56 overflow-hidden")}>
      {searchable && (
        <div className="flex items-center gap-2 border-b border-chene-pale px-3 py-2">
          <Search size={13} className="text-noyer" aria-hidden />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Rechercher une marque"
            className="w-full bg-transparent font-body text-xs text-palissandre outline-none placeholder:text-noyer"
            aria-label="Rechercher une marque"
          />
        </div>
      )}
      <div role="listbox" className="max-h-64 overflow-y-auto py-1">
        <button
          type="button"
          role="option"
          aria-selected={value === null}
          onClick={() => onSelect(null)}
          className={cn("block w-full px-4 py-2.5 text-left font-body text-xs hover:bg-chene-pale", value === null ? "text-terracotta" : "text-palissandre")}
        >
          Tout
        </button>
        {visible.map((o) => (
          <button
            key={o.value}
            type="button"
            role="option"
            aria-selected={value === o.value}
            onClick={() => onSelect(o.value)}
            className={cn("block w-full px-4 py-2.5 text-left font-body text-xs hover:bg-chene-pale", value === o.value ? "text-terracotta" : "text-palissandre")}
          >
            {o.label}
          </button>
        ))}
        {visible.length === 0 && <p className="px-4 py-2.5 font-body text-xs text-noyer">Aucun résultat</p>}
      </div>
    </div>
  );
}

function ColorMenu({ colors, value, onSelect }: { colors: string[]; value: string | null; onSelect: (v: string | null) => void }) {
  return (
    <div className={cn(panelClasses, "w-64 p-4")}>
      <div className="grid grid-cols-4 gap-3">
        {colors.map((name) => {
          const active = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(active ? null : name)}
              aria-pressed={active}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "h-8 w-8 rounded-full border",
                  active ? "border-terracotta ring-2 ring-terracotta ring-offset-2 ring-offset-argile" : "border-chene-dore",
                )}
                // Teinte de la pastille : donnée produit, pas une couleur de la charte
                style={{ background: colorFamily(name)?.swatch }}
                aria-hidden
              />
              <span className="font-body text-[10px] text-palissandre">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PriceMenu({
  bounds,
  min,
  max,
  onCommit,
}: {
  bounds: { min: number; max: number };
  min: number;
  max: number;
  onCommit: (min: number, max: number) => void;
}) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  const span = Math.max(1, bounds.max - bounds.min);
  const pct = (v: number) => ((v - bounds.min) / span) * 100;
  const commit = () => onCommit(Math.min(lo, hi), Math.max(lo, hi));
  const commitProps = { onMouseUp: commit, onTouchEnd: commit, onKeyUp: commit };

  return (
    <div className={cn(panelClasses, "right-0 w-72 p-4 sm:right-auto")}>
      <p className="mb-4 font-body text-xs text-wenge">
        De {Math.min(lo, hi)} € à {Math.max(lo, hi)} €
      </p>
      <div className="range-dual">
        <div className="range-track" />
        <div className="range-fill" style={{ left: `${pct(Math.min(lo, hi))}%`, right: `${100 - pct(Math.max(lo, hi))}%` }} />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={lo}
          onChange={(e) => setLo(Number(e.target.value))}
          aria-label="Prix minimum"
          {...commitProps}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={hi}
          onChange={(e) => setHi(Number(e.target.value))}
          aria-label="Prix maximum"
          {...commitProps}
        />
      </div>
      <div className="mt-4 flex items-center gap-2">
        {(
          [
            ["Min", lo, setLo],
            ["Max", hi, setHi],
          ] as const
        ).map(([label, v, setV]) => (
          <label key={label} className="flex flex-1 items-center gap-1 rounded-xl border border-chene-dore px-3 py-1.5">
            <span className="label text-noyer">{label}</span>
            <input
              type="number"
              min={bounds.min}
              max={bounds.max}
              value={v}
              onChange={(e) => setV(Math.min(bounds.max, Math.max(bounds.min, Number(e.target.value) || 0)))}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              className="w-full bg-transparent text-right font-body text-xs text-palissandre outline-none"
            />
            <span className="font-body text-xs text-noyer">€</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ChipGroup({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: Option[];
  value: string | null;
  onSelect: (v: string | null) => void;
}) {
  return (
    <fieldset>
      <legend className="label mb-2 text-wenge">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onSelect(value === o.value ? null : o.value)}
            className={chipClasses(value === o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Barre de filtres pilotée par l'URL (partageable, SSR).
 * Six filtres visibles, les autres dans « Plus de filtres ». Les valeurs
 * proposées viennent des fiches produits (`facets`). Les filtres peuvent
 * être sauvegardés sur l'appareil et réappliqués en un clic.
 */
export function FilterBar({ facets }: { facets: Facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // localStorage n'existe qu'après hydratation
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(readSaved());
  }, []);

  const get = (k: FilterKey) => params.get(FILTER_PARAMS[k]);
  const priceMin = Number(get("priceMin")) || facets.price.min;
  const priceMax = Number(get("priceMax") ?? params.get("prix")) || facets.price.max;
  const priceActive = priceMin > facets.price.min || priceMax < facets.price.max;

  const navigate = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [pathname, router],
  );

  const update = useCallback(
    (changes: Partial<Record<FilterKey, string | null>>) => {
      const next = new URLSearchParams(params.toString());
      next.delete("prix");
      for (const [k, v] of Object.entries(changes) as Array<[FilterKey, string | null]>) {
        if (v) next.set(FILTER_PARAMS[k], v);
        else next.delete(FILTER_PARAMS[k]);
      }
      navigate(next);
    },
    [params, navigate],
  );

  const select = (key: FilterKey) => (v: string | null) => {
    const changes: Partial<Record<FilterKey, string | null>> = { [key]: v };
    // Une catégorie hors du type de pièce choisi n'a plus de sens
    const category = get("category");
    if (key === "pieceType" && v && category && pieceTypeOf(category) !== v) changes.category = null;
    update(changes);
    setOpen(null);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pieceType = get("pieceType");
  const categories = useMemo(
    () => (pieceType ? facets.categories.filter((c) => pieceTypeOf(c) === pieceType) : facets.categories),
    [facets.categories, pieceType],
  );
  const promoOptions = (Object.keys(PROMOS) as Array<keyof typeof PROMOS>)
    .filter((k) => facets.promos[k])
    .map((k) => ({ value: k, label: PROMOS[k] }));

  const menus: Array<{ key: Exclude<MenuKey, "price">; options: Option[] }> = [
    { key: "gender", options: toOptions(facets.genders) },
    { key: "pieceType", options: toOptions(facets.pieceTypes) },
    { key: "category", options: toOptions(categories) },
  ];
  const moreGroups = [
    { key: "size" as const, options: toOptions(facets.sizes) },
    { key: "material" as const, options: toOptions(facets.materials) },
    { key: "pattern" as const, options: toOptions(facets.patterns) },
    { key: "promo" as const, options: promoOptions },
  ].filter((g) => g.options.length > 0);
  const moreCount = MORE_KEYS.filter((k) => get(k)).length;

  // Filtres actifs, affichés en pastilles retirables
  const chips: Array<{ id: string; label: string; clear: Partial<Record<FilterKey, null>> }> = [];
  for (const key of ["gender", "pieceType", "category", "brand", "color", ...MORE_KEYS] as const) {
    const v = get(key);
    if (!v) continue;
    const display = key === "promo" ? (PROMOS[v as keyof typeof PROMOS] ?? v) : v;
    chips.push({ id: key, label: `${LABELS[key]} : ${display}`, clear: { [key]: null } });
  }
  if (priceActive) {
    chips.push({ id: "price", label: `Prix : ${priceMin} – ${priceMax} €`, clear: { priceMin: null, priceMax: null } });
  }

  const current = filterQuery(params);
  const isSaved = Boolean(current) && saved === current;

  function saveFilters() {
    try {
      localStorage.setItem(SAVED_KEY, current);
      setSaved(current);
    } catch {
      // Stockage indisponible (navigation privée) : on ignore
    }
  }

  function applySaved() {
    if (!saved) return;
    const next = new URLSearchParams(params.toString());
    for (const k of FILTER_PARAM_NAMES) next.delete(k);
    new URLSearchParams(saved).forEach((v, k) => next.set(k, v));
    navigate(next);
  }

  function clearAll() {
    const next = new URLSearchParams(params.toString());
    for (const k of FILTER_PARAM_NAMES) next.delete(k);
    navigate(next);
  }

  return (
    <div ref={rootRef}>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {menus
          .filter((m) => m.options.length > 0)
          .map((m) => (
            <div key={m.key} className="relative">
              <button
                type="button"
                onClick={() => setOpen(open === m.key ? null : m.key)}
                aria-expanded={open === m.key}
                className={triggerClasses(Boolean(get(m.key)))}
              >
                {LABELS[m.key]} <ChevronDown size={12} aria-hidden />
              </button>
              {open === m.key && <ListMenu options={m.options} value={get(m.key)} onSelect={select(m.key)} />}
            </div>
          ))}

        {facets.price.max > facets.price.min && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(open === "price" ? null : "price")}
              aria-expanded={open === "price"}
              className={triggerClasses(priceActive)}
            >
              Prix <ChevronDown size={12} aria-hidden />
            </button>
            {open === "price" && (
              <PriceMenu
                bounds={facets.price}
                min={priceMin}
                max={priceMax}
                onCommit={(lo, hi) =>
                  update({
                    priceMin: lo > facets.price.min ? String(lo) : null,
                    priceMax: hi < facets.price.max ? String(hi) : null,
                  })
                }
              />
            )}
          </div>
        )}

        {facets.brands.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(open === "brand" ? null : "brand")}
              aria-expanded={open === "brand"}
              className={triggerClasses(Boolean(get("brand")))}
            >
              Marque <ChevronDown size={12} aria-hidden />
            </button>
            {open === "brand" && (
              <ListMenu options={toOptions(facets.brands)} value={get("brand")} onSelect={select("brand")} searchable />
            )}
          </div>
        )}

        {facets.colors.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(open === "color" ? null : "color")}
              aria-expanded={open === "color"}
              className={triggerClasses(Boolean(get("color")))}
            >
              Couleur <ChevronDown size={12} aria-hidden />
            </button>
            {open === "color" && <ColorMenu colors={facets.colors} value={get("color")} onSelect={select("color")} />}
          </div>
        )}

        {moreGroups.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMoreOpen(!moreOpen);
              setOpen(null);
            }}
            aria-expanded={moreOpen}
            className={triggerClasses(moreCount > 0 || moreOpen)}
          >
            <SlidersHorizontal size={12} aria-hidden /> Plus de filtres
            {moreCount > 0 && <span className="rounded-full bg-terracotta px-1.5 text-[10px] text-argile">{moreCount}</span>}
          </button>
        )}
      </div>

      {moreOpen && (
        <div className="mt-4 grid gap-5 rounded-2xl border border-chene-dore bg-chene-pale/40 p-4 sm:grid-cols-2 sm:p-5">
          {moreGroups.map((g) => (
            <ChipGroup key={g.key} title={LABELS[g.key]} options={g.options} value={get(g.key)} onSelect={(v) => update({ [g.key]: v })} />
          ))}
        </div>
      )}

      {(chips.length > 0 || saved) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => update(chip.clear)}
              className="flex items-center gap-1.5 rounded-full bg-ebene py-1.5 pr-2 pl-3 font-body text-[11px] text-argile"
              aria-label={`Retirer le filtre ${chip.label}`}
            >
              {chip.label} <X size={11} aria-hidden />
            </button>
          ))}
          {chips.length > 1 && (
            <button type="button" onClick={clearAll} className="font-body text-[11px] uppercase tracking-wide text-wenge underline underline-offset-2">
              Tout effacer
            </button>
          )}
          <span className="ml-auto flex gap-3">
            {saved && !isSaved && (
              <button type="button" onClick={applySaved} className="flex items-center gap-1 font-body text-[11px] uppercase tracking-wide text-terracotta underline underline-offset-2">
                <BookmarkCheck size={12} aria-hidden /> Mes filtres
              </button>
            )}
            {chips.length > 0 && (
              <button
                type="button"
                onClick={saveFilters}
                disabled={isSaved}
                className="flex items-center gap-1 font-body text-[11px] uppercase tracking-wide text-terracotta underline underline-offset-2 disabled:text-noyer disabled:no-underline"
              >
                {isSaved ? <BookmarkCheck size={12} aria-hidden /> : <Bookmark size={12} aria-hidden />}
                {isSaved ? "Filtres sauvegardés" : "Sauvegarder ces filtres"}
              </button>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
