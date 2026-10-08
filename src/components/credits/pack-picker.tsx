"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/credits/packs";
import { createCheckoutSessionAction } from "@/lib/credits/actions";
import { cn } from "@/lib/utils";

const euros = (cents: number) => (cents / 100).toFixed(2).replace(".", ",") + " €";

export function PackPicker({ next, stripeReady }: { next: string; stripeReady: boolean }) {
  const [selected, setSelected] = useState<CreditPackId>("pack30");
  const pack = CREDIT_PACKS.find((p) => p.id === selected)!;

  return (
    <form action={createCheckoutSessionAction}>
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="packId" value={selected} />
      <div className="mb-8 grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Formules de crédits">
        {CREDIT_PACKS.map((p) => {
          const active = p.id === selected;
          const unit = (p.priceCents / p.credits / 100).toFixed(2).replace(".", ",");
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(p.id)}
              className={cn(
                "relative rounded-2xl border-2 p-5 text-left transition-colors",
                active ? "border-terracotta bg-chene-pale" : "border-chene-dore bg-argile hover:border-noyer",
              )}
            >
              {"popular" in p && p.popular && (
                <div className="absolute -top-3 left-4">
                  <Badge tone="saved">Populaire</Badge>
                </div>
              )}
              <p className="font-display text-3xl text-palissandre">{p.credits}</p>
              <p className="label mb-3 text-noyer">crédits IA</p>
              <p className="font-body text-lg text-wenge">{euros(p.priceCents)}</p>
              <p className="mt-1 font-body text-[10px] text-noyer">soit {unit} € par essayage</p>
              {"label" in p && p.label && <p className="mt-1 font-body text-[10px] text-terracotta">{p.label}</p>}
            </button>
          );
        })}
      </div>
      <Button type="submit" className="w-full" disabled={!stripeReady}>
        {stripeReady ? `Payer ${euros(pack.priceCents)}` : "Paiement bientôt disponible"}
      </Button>
    </form>
  );
}
