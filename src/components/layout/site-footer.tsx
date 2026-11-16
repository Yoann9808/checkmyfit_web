import Link from "next/link";
import { Logo } from "./logo";
import { ManageCookiesButton } from "./cookie-banner";

const linkClass = "hover:text-palissandre";

const COLUMNS = [
  {
    title: "Checkmyfit",
    links: [
      { href: "/catalogue", label: "Catalogue" },
      { href: "/credits", label: "Crédits IA" },
      { href: "/a-propos", label: "À propos" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Informations légales",
    links: [
      { href: "/legal/mentions", label: "Mentions légales" },
      { href: "/legal/cgu", label: "CGU et CGV" },
      { href: "/legal/confidentialite", label: "Confidentialité" },
      { href: "/legal/cookies", label: "Politique cookies" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-chene-pale pb-24 md:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-5 md:flex-row md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs font-body text-xs text-wenge">
            Essayez les vêtements sur vous avant d&apos;acheter. Les liens vers les marchands sont des liens affiliés.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:gap-16">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2">
              <p className="label mb-1 text-noyer">{col.title}</p>
              {col.links.map((l) => (
                <Link key={l.href} href={l.href} className={`font-body text-xs text-wenge ${linkClass}`}>
                  {l.label}
                </Link>
              ))}
              {col.title === "Informations légales" && (
                <ManageCookiesButton className={`text-left font-body text-xs text-wenge ${linkClass}`} />
              )}
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}
