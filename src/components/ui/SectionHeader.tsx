import React from "react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────
// SECTION HEADER — Badge + Title + Description
// ────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  /** Small pill label above the title */
  badge?: string;
  /** Optional Lucide icon shown inside the badge */
  BadgeIcon?: React.ComponentType<{ size?: number }>;
  /** Badge color variant */
  badgeVariant?: "accent" | "violet" | "success" | "warning";
  /** The main heading text */
  title: React.ReactNode;
  /** Optional supporting text below the title */
  description?: React.ReactNode;
  /** Text alignment */
  align?: "left" | "center";
  /** Heading level to use — defaults to h2 */
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
}

const badgeVariantMap: Record<string, string> = {
  accent: "bg-accent-muted/20 text-accent",
  violet: "bg-violet-muted/20 text-violet",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export function SectionHeader({
  badge,
  BadgeIcon,
  badgeVariant = "accent",
  title,
  description,
  align = "left",
  headingLevel: Heading = "h2",
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isCenter && "items-center text-center",
        className
      )}
    >
      {badge && (
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold w-fit",
            badgeVariantMap[badgeVariant]
          )}
        >
          {BadgeIcon && <BadgeIcon size={12} />}
          <span>{badge}</span>
        </div>
      )}

      <Heading
        className={cn(
          "font-display text-h1 text-foreground",
          Heading === "h1" && "text-display tracking-tight"
        )}
      >
        {title}
      </Heading>

      {description && (
        <p className={cn("text-body text-foreground-muted", isCenter && "max-w-2xl")}>
          {description}
        </p>
      )}
    </div>
  );
}