import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const BASE =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-none disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS: Record<"solid" | "outline", string> = {
  solid:
    "bg-gold text-void shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:bg-[#8B0000] hover:text-white",
  outline:
    "border border-gold-dim/70 text-gold hover:border-[#8B0000] hover:bg-[#8B0000] hover:text-white",
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