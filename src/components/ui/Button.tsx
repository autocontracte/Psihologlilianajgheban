import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrow } from "./Icons";

type Variant = "primary" | "secondary" | "ghost" | "light";

const variants: Record<Variant, string> = {
  primary:
    "bg-periwinkle text-cream hover:bg-ink shadow-[0_14px_34px_-14px_rgba(103,120,175,0.75)]",
  secondary:
    "bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink hover:text-cream",
  ghost: "bg-transparent text-ink hover:text-periwinkle px-0",
  light:
    "bg-cream text-ink hover:bg-periwinkle-pale shadow-[0_14px_34px_-16px_rgba(0,0,0,0.4)]",
};

export function Button({
  href,
  children,
  variant = "primary",
  withArrow = true,
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  withArrow?: boolean;
  className?: string;
  external?: boolean;
}) {
  const classes = [
    "group inline-flex items-center gap-2.5 rounded-pill px-7 py-3.5",
    "font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em]",
    "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    variants[variant],
    className,
  ].join(" ");

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <IconArrow className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
      )}
    </>
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
