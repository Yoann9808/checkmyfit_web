"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/import", label: "Import CSV" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2" aria-label="Administration">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full border border-noyer px-4 py-2 font-body text-xs uppercase tracking-wide",
              active ? "bg-ebene text-argile" : "text-palissandre hover:bg-chene-pale",
            )}
            aria-current={active ? "page" : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
