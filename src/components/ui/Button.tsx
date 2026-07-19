"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonHover } from "@/lib/animations";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  /**
   * asChild — when true, the Button renders its direct child as the root
   * element, merging Button's class/props onto it. Use for link-buttons:
   *   <Button asChild><Link href="/foo">Go</Link></Button>
   */
  asChild?: boolean;
}

/**
 * Button — Animated, accessible button with variant + size system.
 *
 * When `asChild` is true the component clones its single child and
 * merges all styling + motion props onto it, so a <Link> or <a> receives
 * the full button treatment without nesting invalid HTML.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { children, className, variant = "primary", size = "md", asChild, ...props },
    ref
  ) {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
      secondary:
        "bg-background-elevated text-foreground hover:bg-background-overlay border border-border",
      outline:
        "bg-transparent text-foreground border border-border hover:bg-background-overlay",
      ghost: "bg-transparent text-foreground hover:bg-background-overlay",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-caption",
      lg: "px-6 py-3 text-body",
    };

    const combinedClass = cn(baseStyles, variants[variant], sizes[size], className);

    // asChild: clone the single child and merge props onto it
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        className: cn(combinedClass, (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.className),
      });
    }

    return (
      <motion.button
        ref={ref}
        className={combinedClass}
        whileHover={buttonHover.whileHover}
        whileTap={buttonHover.whileTap}
        transition={buttonHover.transition}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
