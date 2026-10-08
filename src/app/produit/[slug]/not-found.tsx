import { ButtonLink } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <section className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-3xl text-palissandre">Ce produit n&apos;existe plus</h1>
      <p className="mt-2 font-body text-sm text-wenge">
        Il a peut-être été retiré du catalogue par le marchand.
      </p>
      <ButtonLink href="/catalogue" className="mt-8">
        Voir le catalogue
      </ButtonLink>
    </section>
  );
}
