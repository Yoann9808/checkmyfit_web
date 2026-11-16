import type { ReactNode } from "react";

/** Gabarit des pages éditoriales (légal, à propos, FAQ, contact). */
export function ContentPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-5 sm:py-14">
      <h1 className="font-display text-4xl text-palissandre">{title}</h1>
      {updated && <p className="mt-2 font-body text-xs text-noyer">Dernière mise à jour : {updated}</p>}
      {intro && <p className="mt-4 font-body text-sm text-wenge">{intro}</p>}
      <div className="mt-8 flex flex-col gap-7">{children}</div>
    </section>
  );
}

export function ContentSection({ id, heading, children }: { id?: string; heading: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24">
      <h2 className="label mb-2 text-wenge">{heading}</h2>
      <div className="flex flex-col gap-2 font-body text-sm text-palissandre">{children}</div>
    </div>
  );
}
