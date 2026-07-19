import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// LOADING SPINNER — Centered page/section loader
// ─────────────────────────────────────────────────────────────────

interface LoadingSpinnerProps {
  /** Size of the Lucide Loader2 icon in px */
  size?: number;
  /** Extra padding class — defaults to py-20 */
  className?: string;
}

export function LoadingSpinner({ size = 32, className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex justify-center items-center py-20", className)}
      aria-label="Memuat data..."
      role="status"
    >
      <Loader2 className="animate-spin text-accent" size={size} />
    </div>
  );
}
