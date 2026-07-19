"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// MODAL — Solid, fully opaque dialog. No transparency in panel.
// bg-white in light mode, dark slate in dark mode.
// ─────────────────────────────────────────────────────────────────

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  asForm?: boolean;
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
      {/* Header — sticky, solid background */}
      {title && (
        <div className="flex justify-between items-center px-6 py-5 md:px-8 border-b border-border shrink-0 bg-white dark:bg-[#111113] z-20">
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

      {/* Body — scrollable */}
      <div className={cn("overflow-y-auto flex-1 p-6 md:p-8 min-h-0", bodyClassName)}>
        {children}
      </div>

      {/* Footer — sticky, solid background */}
      {footer && (
        <div className="px-6 py-4 md:px-8 border-t border-border bg-white dark:bg-[#111113] sticky bottom-0 shrink-0 z-20 flex justify-end items-center gap-3">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal panel — fully solid, no transparency */}
          <motion.div
            initial={{ scale: 0.97, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full bg-white dark:bg-[#111113] border border-border rounded-2xl",
              "shadow-[0_24px_64px_rgba(0,0,0,0.3)] overflow-hidden",
              "max-h-[90vh] flex flex-col min-h-0",
              maxWidth,
              className
            )}
          >
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
