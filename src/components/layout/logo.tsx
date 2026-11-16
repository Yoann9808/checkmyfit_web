import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logo from "../../../public/images/logo-checkmyfit.png";

/** Logo officiel (fichier `logo_checkmyfit_VF` de l'espace Notion, fond rendu transparent). */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center", className)} aria-label="Checkmyfit, accueil">
      <Image src={logo} alt="CheckMyFit" priority className="h-6 w-auto sm:h-7" />
    </Link>
  );
}
