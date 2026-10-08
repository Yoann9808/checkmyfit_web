import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getSessionUser } from "@/lib/auth/session";
import { safeInternalPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Connexion" };

export default async function SignInPage({ searchParams }: PageProps<"/connexion">) {
  const params = await searchParams;
  const next = safeInternalPath(params.next);
  if (await getSessionUser()) redirect(next);

  const erreur = params.erreur === "google" ? "La connexion Google a échoué." : params.erreur === "callback" ? "Le lien de connexion est invalide ou expiré." : undefined;

  return (
    <section className="px-4 py-12 sm:px-5 sm:py-16">
      <AuthForm mode="signin" next={next} initialError={erreur} />
    </section>
  );
}
