"use client";

import { useTransition } from "react";
import { DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markOnboardingSeenAction } from "@/lib/profile/actions";

export function WardrobeOnboarding() {
  const [pending, start] = useTransition();
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ebene/70 px-5" role="dialog" aria-modal="true" aria-labelledby="wardrobe-onboarding-title">
      <div className="w-full max-w-sm rounded-3xl bg-argile p-7">
        <DoorOpen className="mb-3 h-8 w-8 text-terracotta" aria-hidden />
        <h2 id="wardrobe-onboarding-title" className="font-display text-2xl text-palissandre">
          Bienvenue dans votre dressing
        </h2>
        <p className="mt-3 font-body text-sm text-wenge">
          Rangez ici vos essayages IA et vos propres vêtements, classés par famille. La catégorie{" "}
          <span className="font-display italic">Futurs achats</span> garde une trace de tout ce que vous avez
          essayé et aimé.
        </p>
        <Button onClick={() => start(() => markOnboardingSeenAction())} disabled={pending} className="mt-6 w-full">
          Compris
        </Button>
      </div>
    </div>
  );
}
