import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getSessionUser } from "@/lib/auth/session";
import { safeInternalPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignUpPage({ searchParams }: PageProps<"/inscription">) {
  const params = await searchParams;
  const next = safeInternalPath(params.next);
  if (await getSessionUser()) redirect(next);

  return (
    <section className="px-4 py-12 sm:px-5 sm:py-16">
      <AuthForm mode="signup" next={next} />
    </section>
  );
}
