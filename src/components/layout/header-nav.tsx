"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DoorOpen, LayoutGrid, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/catalogue", label: "Catalogue", icon: LayoutGrid },
  { href: "/essayage", label: "Essayer", icon: Sparkles },
  { href: "/dressing", label: "Mon dressing", icon: DoorOpen },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

/** Navigation desktop (masquée sous md). */
export function HeaderNav() {
  const isActive = useIsActive();
  return (
    <nav
      className="hidden items-center gap-6 font-body text-sm uppercase tracking-wide text-wenge md:flex"
      aria-label="Navigation principale"
    >
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-palissandre",
            isActive(item.href) && "text-terracotta",
          )}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Barre d'onglets mobile (visible sous md).
 * Remplace le menu absent de la maquette sur petit écran.
 */
export function MobileTabBar() {
  const isActive = useIsActive();
  const tabs = [...NAV, { href: "/compte", label: "Compte", icon: User }] as const;
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-chene-pale bg-argile/95 backdrop-blur md:hidden"
      aria-label="Navigation mobile"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 font-body text-[10px] uppercase tracking-wide",
                  active ? "text-terracotta" : "text-wenge",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} aria-hidden />
                {item.label.replace("Mon ", "")}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
