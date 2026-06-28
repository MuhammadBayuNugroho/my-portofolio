"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHover } from "@/lib/animations";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  children,
  className,
  hoverEffect = true,
  ...props
}: CardProps) {
  const CardComponent = hoverEffect ? motion.div : "div";
  const hoverProps = hoverEffect
    ? {
        whileHover: cardHover.whileHover,
        transition: cardHover.transition,
      }
    : {};

  return (
    // @ts-expect-error - dynamic tag interpolation typing override
    <CardComponent
      className={cn(
        "rounded-xl border border-border bg-background-elevated p-6 shadow-soft transition-colors duration-300 dark:shadow-dark-soft",
        hoverEffect && "hover:border-border-strong",
        className
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
}
