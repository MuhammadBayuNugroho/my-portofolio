"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// MODAL — Animated overlay dialog
// ─────────────────────────────────────────────────────────────────

export interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Called when the user clicks the backdrop or the close button */
  onClose: () => void;
  /** Rendered in the modal header bar */
  title?: React.ReactNode;
  /** Modal body content */
  children: React.ReactNode;
  /** Tailwind max-width class, e.g. "max-w-2xl" */
  maxWidth?: string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  className,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal panel */}
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full bg-background-elevated border border-border rounded-xl",
              "shadow-glow-accent overflow-hidden max-h-[90vh] flex flex-col",
              maxWidth,
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
                <div className="font-display text-h2 font-bold text-foreground">{title}</div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-background-overlay text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Body (scrollable) */}
            <div className="overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
