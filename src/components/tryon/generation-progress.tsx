"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SilhouetteIcon } from "@/components/ui/garment-icons";

const STEPS = [
  "Analyse de votre silhouette…",
  "Ajustement du vêtement à votre morphologie…",
  "Calage de la lumière et des matières…",
  "Finalisation du rendu…",
];

const POLL_MS = 1500;
const STEP_MS = 5000;

export function GenerationProgress({
  tryonId,
  initialStatus,
  initialError,
  photoUrl,
  productImageUrl,
  productSlug,
  productName,
}: {
  tryonId: string;
  initialStatus: string;
  initialError: string | null;
  photoUrl: string | null;
  productImageUrl: string | null;
  productSlug: string | null;
  productName: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(initialError);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (status === "failed") return;
    const stepTimer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), STEP_MS);
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/tryon/${tryonId}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status: string; error: string | null };
        if (data.status === "succeeded") {
          router.replace(`/essayage/resultat/${tryonId}`);
        } else if (data.status === "failed") {
          setStatus("failed");
          setError(data.error);
        }
      } catch {
        // réseau : on réessaie au prochain tick
      }
    }, POLL_MS);
    return () => {
      clearInterval(stepTimer);
      clearInterval(poll);
    };
  }, [status, tryonId, router]);

  const back = productSlug ? `/produit/${productSlug}` : "/essayage";

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-palissandre px-6 py-16">
      <div className="max-w-sm text-center">
        <div className="relative mx-auto mb-8 h-52 w-40 overflow-hidden rounded-3xl bg-wenge">
          {photoUrl ? (
            <Image src={photoUrl} alt="" fill unoptimized className="object-cover opacity-70" />
          ) : (
            <SilhouetteIcon className="m-auto h-40 w-24 text-sable-brule" />
          )}
          {productImageUrl && (
            <div className="absolute right-3 bottom-3 h-12 w-12 overflow-hidden rounded-xl bg-argile p-1.5">
              <Image src={productImageUrl} alt="" width={48} height={48} className="h-full w-full object-contain" />
            </div>
          )}
          {status !== "failed" && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: "linear-gradient(180deg, transparent, rgb(176 92 42 / 0.35))" }}
            />
          )}
        </div>

        {status === "failed" ? (
          <>
            <Badge tone="danger">Échec</Badge>
            <p className="mt-4 font-display text-lg italic text-argile">
              Le rendu n&apos;a pas pu être généré.
            </p>
            <p className="mt-2 font-body text-xs text-sable-brule">
              Votre crédit a été remboursé. {error ? `Détail : ${error}` : ""}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink href={back}>Réessayer</ButtonLink>
              <ButtonLink href="/essayage" variant="secondary" className="border-sable-brule text-argile hover:bg-wenge">
                Choisir une autre pièce
              </ButtonLink>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-sable-brule" aria-hidden />
              <Badge tone="ia">IA</Badge>
            </div>
            <p className="font-display text-lg italic text-argile" aria-live="polite">
              {STEPS[step]}
            </p>
            <p className="mt-2 font-body text-xs text-sable-brule">
              Checkmyfit assemble {productName.toLowerCase()} sur vous. Comptez une vingtaine de secondes.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
