import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";

const styles: Record<Variant, string> = {
  solid: "bg-stellar-pink text-stellar-black hover:bg-stellar-white",
  outline: "border-2 border-stellar-white text-stellar-white hover:bg-stellar-white hover:text-stellar-black",
  ghost: "text-stellar-white underline decoration-stellar-pink decoration-2 underline-offset-4 hover:text-stellar-pink",
};

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-3 font-demi text-xs font-bold uppercase tracking-widest transition-colors";

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
