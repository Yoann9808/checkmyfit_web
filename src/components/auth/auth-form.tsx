"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { signInAction, signInWithGoogleAction, signUpAction, type AuthState } from "@/lib/auth/actions";

export function AuthForm({ mode, next, initialError }: { mode: "signin" | "signup"; next: string; initialError?: string }) {
  const action = mode === "signup" ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);
  const error = state?.error ?? initialError;

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-display text-4xl text-palissandre">
        {mode === "signup" ? "Créez votre compte" : "Bon retour"}
      </h1>
      <p className="mt-2 font-body text-sm text-wenge">
        {mode === "signup"
          ? "Nécessaire pour enregistrer votre photo et vos essayages. 20 crédits IA offerts."
          : "Connectez-vous pour retrouver votre dressing et vos crédits."}
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <label className="flex flex-col gap-1.5">
          <span className="label text-wenge">Adresse e-mail</span>
          <input name="email" type="email" required autoComplete="email" className="field" placeholder="vous@exemple.fr" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label text-wenge">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="field"
            placeholder="8 caractères minimum"
          />
        </label>
        {error && (
          <p role="alert" className="rounded-xl bg-brique/10 px-4 py-3 font-body text-xs text-brique">
            {error}
          </p>
        )}
        {state?.info && (
          <p role="status" className="rounded-xl bg-chene-pale px-4 py-3 font-body text-xs text-palissandre">
            {state.info}
          </p>
        )}
        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Un instant…" : mode === "signup" ? "Créer mon compte" : "Me connecter"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-chene-dore" />
        <span className="label text-noyer">ou</span>
        <div className="h-px flex-1 bg-chene-dore" />
      </div>

      <form action={signInWithGoogleAction}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" className="w-full">
          Continuer avec Google
        </Button>
      </form>

      <p className="mt-8 text-center font-body text-xs text-wenge">
        {mode === "signup" ? (
          <>
            Déjà un compte ?{" "}
            <Link href={`/connexion?next=${encodeURIComponent(next)}`} className="text-terracotta underline underline-offset-2">
              Se connecter
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{" "}
            <Link href={`/inscription?next=${encodeURIComponent(next)}`} className="text-terracotta underline underline-offset-2">
              Créer un compte
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
