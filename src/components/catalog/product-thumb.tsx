import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { FamilyIcon } from "@/components/ui/garment-icons";
import { productImageUrl } from "@/lib/catalog/images";
import { cn } from "@/lib/utils";

export function ProductThumb({
  name,
  category,
  imagePath,
  hasTryOn = false,
  className,
  sizes = "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw",
  priority = false,
}: {
  name: string;
  category: string;
  imagePath: string | null;
  hasTryOn?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = productImageUrl(imagePath);
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-chene-pale p-2",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-2"
        />
      ) : (
        <FamilyIcon category={category} className="h-14 w-14 text-noyer" />
      )}
      {hasTryOn && (
        <div className="absolute top-3 left-3">
          <Badge tone="ia">IA</Badge>
        </div>
      )}
    </div>
  );
}
