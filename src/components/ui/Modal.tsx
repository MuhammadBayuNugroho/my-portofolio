"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// MODAL — Redesigned solid dialog with sticky layout support
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
  bodyClassName?: string;
  /** Optional sticky footer content */
  footer?: React.ReactNode;
  /** Whether the modal contents should be wrapped in a form tag */
  asForm?: boolean;
  /** Form submission handler if asForm is true */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  className,
  bodyClassName,
  footer,
  asForm = false,
  onSubmit,
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

  const modalContent = (
    <>
      {/* Header (Sticky/Shrink-0) */}
      {title && (
        <div className="flex justify-between items-center p-6 md:px-8 md:py-6 border-b border-border shrink-0 bg-white dark:bg-[#111827] z-20">
          <div className="font-display text-h3 font-bold text-foreground">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-background-overlay text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Body (Scrollable container) */}
      <div className={cn("overflow-y-auto flex-1 p-6 md:p-8 min-h-0", bodyClassName)}>
        {children}
      </div>

      {/* Footer (Sticky/Shrink-0) */}
      {footer && (
        <div className="p-6 md:px-8 md:py-5 border-t border-border bg-background-elevated sticky bottom-0 shrink-0 z-20 flex justify-end items-center gap-3">
          {footer}
        </div>
      )}
    </>
  );

  const ModalWrapper = asForm ? "form" : "div";
  const wrapperProps = asForm
    ? {
        onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
          if (onSubmit) onSubmit(e);
        },
      }
    : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal panel container */}
          <motion.div
            initial={{ scale: 0.97, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full bg-white dark:bg-[#111827] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[24px]",
              "shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden max-h-[90vh] flex flex-col min-h-0",
              maxWidth,
              className
            )}
          >
            {/* Render wrapper dynamically as div or form */}
            {/* @ts-expect-error - Dynamic wrapper tag type interpolation */}
            <ModalWrapper className="flex flex-col flex-1 min-h-0" {...wrapperProps}>
              {modalContent}
            </ModalWrapper>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

