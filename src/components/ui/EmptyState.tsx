import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────
// EMPTY STATE — Consistent "no results" display
// ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Primary message, e.g. "Artikel tidak ditemukan." */
  message?: string;
  /** Supporting hint below the message */
  hint?: string;
  /** Optional Lucide icon to display above the message */
  Icon?: typeof SearchX;
  className?: string;
}

export function EmptyState({
  message = "Data tidak ditemukan.",
  hint,
  Icon = SearchX,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center gap-4",
        className
      )}
    >
      <Icon
        size={48}
        className="text-foreground-subtle opacity-40"
        strokeWidth={1.25}
      />
      <div>
        <p className="text-body-lg text-foreground-muted font-medium">{message}</p>
        {hint && (
          <p className="text-xs text-foreground-subtle mt-1">{hint}</p>
        )}
      </div>
    </div>
  );
}