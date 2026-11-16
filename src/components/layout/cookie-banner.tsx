"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const CONSENT_COOKIE = "cmf_consent";
const OPEN_EVENT = "cmf:open-cookie-banner";
/** 6 mois, durée de conservation du choix recommandée par la CNIL. */
const MAX_AGE = 60 * 60 * 24 * 182;

export type ConsentValue = "accepted" | "refused";

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(accepted|refused)`));
  return (match?.[1] as ConsentValue | undefined) ?? null;
}

function writeConsent(value: ConsentValue) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

/**
 * Bandeau de consentement. Le site n'utilise aujourd'hui que des cookies
 * nécessaires ; tout futur outil de mesure doit vérifier `readConsent() === "accepted"`.
 * Accepter et refuser ont le même poids visuel (exigence CNIL).
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Lecture du cookie après hydratation uniquement (absent du rendu serveur)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (readConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (value: ConsentValue) => {
    writeConsent(value);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-16 z-40 px-4 pb-3 md:bottom-0 md:pb-5"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-chene-dore bg-argile p-5 shadow-lg sm:flex-row sm:items-center">
        <p className="flex-1 font-body text-xs text-palissandre">
          Nous utilisons des cookies nécessaires au fonctionnement du site (connexion). Avec votre accord, nous
          pourrons aussi mesurer l&apos;audience pour améliorer le service.{" "}
          <Link href="/legal/cookies" className="text-terracotta underline underline-offset-2">
            En savoir plus
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={() => choose("refused")}>
            Refuser
          </Button>
          <Button size="sm" onClick={() => choose("accepted")}>
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Lien du pied de page pour rouvrir le bandeau. */
export function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Gérer les cookies
    </button>
  );
}
