import Link from "next/link";
import { Sparkles, User } from "lucide-react";
import { Logo } from "./logo";
import { HeaderNav, MobileTabBar } from "./header-nav";
import { getSessionUser } from "@/lib/auth/session";
import { plural } from "@/lib/utils";

export async function SiteHeader() {
  const session = await getSessionUser();
  const credits = session?.profile.credits_balance ?? null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-chene-pale bg-argile/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
          <Logo />
          <HeaderNav />
          <div className="flex items-center gap-3 sm:gap-4">
            {credits !== null ? (
              <Link
                href="/credits"
                className="flex items-center gap-1.5 rounded-full bg-chene-pale px-3 py-1.5 font-body text-[11px] font-medium uppercase tracking-wide text-palissandre transition-colors hover:bg-chene-dore"
                title="Acheter des crédits IA"
              >
                <Sparkles size={12} className="text-terracotta" aria-hidden />
                <span className="hidden sm:inline">{plural(credits, "crédit")} IA</span>
                <span className="sm:hidden">{credits}</span>
              </Link>
            ) : null}
            <Link
              href={session ? "/compte" : "/connexion"}
              className="text-palissandre transition-colors hover:text-terracotta"
              aria-label={session ? "Mon compte" : "Se connecter"}
            >
              <User size={20} strokeWidth={1.6} aria-hidden />
            </Link>
          </div>
        </div>
      </header>
      <MobileTabBar />
    </>
  );
}
