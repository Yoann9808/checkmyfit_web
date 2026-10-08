import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "ia" | "saved" | "danger";

const tones: Record<Tone, string> = {
  default: "bg-chene-pale text-wenge",
  ia: "bg-argile text-terracotta border border-terracotta",
  saved: "bg-palissandre text-argile",
  danger: "bg-brique text-argile",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-body text-[10px] font-medium uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
