import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-chene-pale pb-24 md:pb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs font-body text-xs text-wenge">
            Essayez les vêtements sur vous avant d&apos;acheter. Les liens vers
            les marchands sont des liens affiliés.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-body text-[11px] uppercase tracking-wide text-wenge">
          <Link href="/catalogue" className="hover:text-palissandre">Catalogue</Link>
          <Link href="/credits" className="hover:text-palissandre">Crédits IA</Link>
          <Link href="/legal/confidentialite" className="hover:text-palissandre">Confidentialité</Link>
          <Link href="/legal/cgu" className="hover:text-palissandre">CGU</Link>
          <Link href="/legal/mentions" className="hover:text-palissandre">Mentions légales</Link>
        </nav>
      </div>
    </footer>
  );
}
