"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonHover } from "@/lib/animations";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  asChild,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-sans font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
    secondary: "bg-background-elevated text-foreground hover:bg-background-overlay border border-border",
    outline: "bg-transparent text-foreground border border-border hover:bg-background-overlay",
    ghost: "bg-transparent text-foreground hover:bg-background-overlay",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-caption",
    lg: "px-6 py-3 text-body",
  };

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={buttonHover.whileHover}
      whileTap={buttonHover.whileTap}
      transition={buttonHover.transition}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
