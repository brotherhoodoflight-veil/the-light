import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS: Record<"solid" | "outline", string> = {
  solid:
    "bg-gold text-void shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:bg-gold-soft hover:shadow-[0_0_28px_rgba(242,216,125,0.4)]",
  outline:
    "border border-gold-dim/70 text-gold hover:border-gold hover:bg-gold/5 hover:text-gold-soft",
};

type GoldButtonProps = {
  variant?: "solid" | "outline";
  className?: string;
} & ComponentPropsWithoutRef<"button">;

export function GoldButton({
  variant = "solid",
  className = "",
  type = "button",
  children,
  ...rest
}: GoldButtonProps) {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

type GoldLinkProps = {
  variant?: "solid" | "outline";
  className?: string;
} & ComponentPropsWithoutRef<typeof Link>;

export function GoldLink({
  variant = "solid",
  className = "",
  children,
  ...rest
}: GoldLinkProps) {
  return (
    <Link className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}