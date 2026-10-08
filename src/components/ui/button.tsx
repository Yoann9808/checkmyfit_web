import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-body font-medium uppercase tracking-wide transition-colors duration-200 select-none disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-terracotta text-argile hover:bg-brique disabled:bg-chene-pale disabled:text-noyer",
  secondary:
    "border border-noyer text-palissandre hover:bg-chene-pale disabled:opacity-50",
  ghost: "text-terracotta underline underline-offset-4 hover:text-brique",
  dark: "bg-palissandre text-argile hover:bg-ebene",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-3.5 text-xs",
  lg: "px-8 py-4 text-sm",
};

export function buttonClasses(opts: { variant?: Variant; size?: Size; className?: string } = {}) {
  const { variant = "primary", size = "md", className } = opts;
  return cn(base, variants[variant], variant === "ghost" ? "px-0 py-0" : sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}
