import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";

const styles: Record<Variant, string> = {
  solid: "bg-nova text-ink hover:bg-cream",
  outline: "border border-cream/40 text-cream hover:border-nova hover:text-nova",
  ghost: "text-cream underline decoration-nova decoration-2 underline-offset-4 hover:text-nova",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-tag text-xs uppercase tracking-widest transition-colors";

export function CtaLink({
  variant = "solid",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link {...props} className={cn(base, styles[variant], className)}>
      {children}
    </Link>
  );
}

export function CtaAnchor({
  variant = "solid",
  className,
  children,
  ...props
}: ComponentProps<"a"> & { variant?: Variant }) {
  return (
    <a {...props} className={cn(base, styles[variant], className)}>
      {children}
    </a>
  );
}
