"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  external?: boolean;
};

const variants = {
  primary:
    "bg-[#C9A84C] text-black hover:bg-[#b8963f] active:bg-[#a5873a] font-semibold tracking-wide",
  secondary:
    "bg-black text-[#C9A84C] border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-black font-semibold tracking-wide",
  ghost:
    "bg-transparent text-white hover:text-[#C9A84C] font-medium tracking-wide",
  outline:
    "bg-transparent text-black border border-black hover:bg-black hover:text-white font-semibold tracking-wide",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  onClick,
  type = "button",
  disabled,
  external,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center transition-all duration-200 uppercase tracking-widest",
    variants[variant],
    sizes[size],
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
