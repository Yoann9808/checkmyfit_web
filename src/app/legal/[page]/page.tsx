import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ContentPage, ContentSection } from "@/components/layout/content-page";
import { LEGAL_PAGES } from "@/lib/legal/content";

export function generateStaticParams() {
  return Object.keys(LEGAL_PAGES).map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[page]">): Promise<Metadata> {
  const { page } = await params;
  return { title: LEGAL_PAGES[page]?.title ?? "Informations légales" };
}

export default async function LegalPage({ params }: PageProps<"/legal/[page]">) {
  const { page } = await params;
  // CGU et CGV partagent la même page
  if (page === "cgv") permanentRedirect("/legal/cgu#cgv");
  const content = LEGAL_PAGES[page];
  if (!content) notFound();

  return (
    <ContentPage title={content.title} intro={content.intro} updated={content.updated}>
      {content.sections.map((s) => (
        <ContentSection key={s.heading} id={s.id} heading={s.heading}>
          {s.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </ContentSection>
      ))}
    </ContentPage>
  );
}
