import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Checkmyfit — Essayez avant d'acheter",
    template: "%s · Checkmyfit",
  },
  description:
    "Uploadez une photo et voyez exactement ce que chaque pièce donne sur vous, avant l'achat.",
};

export const viewport: Viewport = {
  themeColor: "#F5E8DC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${dmSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
