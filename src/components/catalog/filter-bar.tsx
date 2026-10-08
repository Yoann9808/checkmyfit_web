"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { CATEGORIES, GENDERS, PRICE_MAX_DEFAULT } from "@/lib/catalog/taxonomy";
import { cn } from "@/lib/utils";

const ALL = "Toutes";

type FilterKey = "categorie" | "marque" | "couleur" | "genre" | "prix";

const LABELS: Record<FilterKey, string> = {
  marque: "Marque",
  categorie: "Catégorie",
  couleur: "Couleur",
  genre: "Genre",
  prix: "Prix",
};

const triggerClasses = (active: boolean) =>
  cn(
    "flex items-center gap-1.5 rounded-full border px-4 py-2 font-body text-[11px] whitespace-nowrap uppercase tracking-wide text-palissandre",
    active ? "border-terracotta bg-chene-pale" : "border-noyer",
  );

function Dropdown({
  label,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  value: string;
  options: readonly string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button type="button" onClick={onToggle} aria-expanded={open} className={triggerClasses(value !== ALL)}>
        {label} <ChevronDown size={12} aria-hidden />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 min-w-52 overflow-y-auto rounded-2xl border border-chene-dore bg-argile shadow-lg"
        >
          {[ALL, ...options].map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={value === o}
              onClick={() => onSelect(o)}
              className={cn(
                "block w-full px-4 py-2.5 text-left font-body text-xs hover:bg-chene-pale",
                value === o ? "text-terracotta" : "text-palissandre",
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceSlider({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [local, setLocal] = useState(value);
  return (
    <>
      <p className="mb-3 font-body text-xs text-wenge">Jusqu&apos;à {local} €</p>
      <input
        type="range"
        min={10}
        max={PRICE_MAX_DEFAULT}
        step={10}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={() => onCommit(local)}
        onTouchEnd={() => onCommit(local)}
        onKeyUp={() => onCommit(local)}
        className="w-full"
        aria-label="Prix maximum"
      />
    </>
  );
}

/**
 * Barre de filtres pilotée par l'URL (partageable, SSR).
 * Un seul menu ouvert à la fois ; fermeture au clic extérieur et à Échap.
 */
export function FilterBar({ brands, colors }: { brands: string[]; colors: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState<FilterKey | null>(null);
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const get = (k: FilterKey) => params.get(k) ?? ALL;
  const priceMax = Number(params.get("prix")) || PRICE_MAX_DEFAULT;

  const set = useCallback(
    (key: FilterKey, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === ALL) next.delete(key);
      else next.set(key, value);
      const qs = next.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [params, pathname, router],
  );

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

  const chips: Array<{ key: FilterKey; label: string }> = [];
  for (const key of ["categorie", "marque", "couleur", "genre"] as const) {
    const v = get(key);
    if (v !== ALL) chips.push({ key, label: `${LABELS[key]} : ${v}` });
  }
  if (priceMax < PRICE_MAX_DEFAULT) chips.push({ key: "prix", label: `Prix : jusqu'à ${priceMax} €` });

  const dropdowns: Array<{ key: Exclude<FilterKey, "prix">; options: readonly string[] }> = [
    { key: "categorie", options: CATEGORIES },
    { key: "marque", options: brands },
    { key: "couleur", options: colors },
    { key: "genre", options: GENDERS },
  ];

  return (
    <div ref={rootRef}>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {dropdowns.map((d) => (
          <Dropdown
            key={d.key}
            label={LABELS[d.key]}
            value={get(d.key)}
            options={d.options}
            open={open === d.key}
            onToggle={() => setOpen(open === d.key ? null : d.key)}
            onSelect={(v) => {
              set(d.key, v);
              setOpen(null);
            }}
          />
        ))}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(open === "prix" ? null : "prix")}
            aria-expanded={open === "prix"}
            className={triggerClasses(priceMax < PRICE_MAX_DEFAULT)}
          >
            Prix <ChevronDown size={12} aria-hidden />
          </button>
          {open === "prix" && (
            <div className="absolute right-0 z-30 mt-2 min-w-56 rounded-2xl border border-chene-dore bg-argile p-4 shadow-lg sm:right-auto">
              <PriceSlider value={priceMax} onCommit={(v) => set("prix", v >= PRICE_MAX_DEFAULT ? null : String(v))} />
            </div>
          )}
        </div>
      </div>
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => set(chip.key, null)}
              className="flex items-center gap-1.5 rounded-full bg-ebene py-1.5 pr-2 pl-3 font-body text-[11px] text-argile"
              aria-label={`Retirer le filtre ${chip.label}`}
            >
              {chip.label} <X size={11} aria-hidden />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
