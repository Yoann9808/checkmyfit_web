import { Shirt, Watch } from "lucide-react";
import { familyOf } from "@/lib/catalog/taxonomy";

export const PantsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
    <path d="M6 2h12l1.2 6.5-2 13h-3l-1-11.5-1 11.5H9l-2-13L6 2z" />
  </svg>
);

export const ShoeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 17.5c0-1.8 1.6-2.7 3.4-3.6l4.6-3.4c1-.8 1.8-1 2.8-1h2.2c1 0 1.7.8 1.7 1.7v2.4c0 .9.8 1.7 1.7 1.7h2.1c1 0 1.5.9 1.5 1.8v2H2.5v-1.6z" />
  </svg>
);

export const SilhouetteIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 160" className={className} fill="currentColor" aria-hidden>
    <circle cx="50" cy="30" r="21" />
    <path d="M50 56c-24 0-39 19-39 43v56h78v-56c0-24-15-43-39-43z" />
  </svg>
);

/** Icône de repli selon la famille du vêtement. */
export function FamilyIcon({ category, className }: { category: string; className?: string }) {
  const family = familyOf(category);
  if (family === "shoes") return <ShoeIcon className={className} />;
  if (family === "bottom") return <PantsIcon className={className} />;
  if (family === "accessory") return <Watch className={className} strokeWidth={1.4} />;
  return <Shirt className={className} strokeWidth={1.4} />;
}
