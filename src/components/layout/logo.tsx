import Link from "next/link";
import { DoorOpen } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-1.5 font-display text-xl ${className}`}
      aria-label="Checkmyfit, accueil"
    >
      <span className="italic text-terracotta">Check</span>
      <DoorOpen size={20} className="text-wenge" strokeWidth={1.5} aria-hidden />
      <span className="not-italic font-medium text-palissandre">MyFit</span>
    </Link>
  );
}
