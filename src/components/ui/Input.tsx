import React from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// INPUT — Reusable form input with label & error state
// ─────────────────────────────────────────────────────────────────

interface InputBaseProps {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export type InputProps = InputBaseProps &
  React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, id, className, wrapperClassName, ...props }, ref) {
    const inputClass = cn(
      "w-full rounded-md border border-border bg-background px-4 py-2 text-caption text-foreground",
      "placeholder:text-foreground-subtle focus-visible:outline-2 focus-visible:outline-accent transition-colors",
      error && "border-error focus-visible:outline-error",
      className
    );

    return (
      <div className={cn("flex flex-col gap-2", wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-foreground-muted">
            {label}
          </label>
        )}
        <input id={id} ref={ref} className={inputClass} {...props} />
        {error && (
          <p className="text-[10px] text-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─────────────────────────────────────────────────────────────────
// TEXTAREA — Same visual system as Input
// ─────────────────────────────────────────────────────────────────

interface TextareaBaseProps {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export type TextareaProps = TextareaBaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, id, className, wrapperClassName, ...props }, ref) {
    const textareaClass = cn(
      "w-full rounded-md border border-border bg-background px-4 py-2 text-caption text-foreground resize-none",
      "placeholder:text-foreground-subtle focus-visible:outline-2 focus-visible:outline-accent transition-colors",
      error && "border-error focus-visible:outline-error",
      className
    );

    return (
      <div className={cn("flex flex-col gap-2", wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-foreground-muted">
            {label}
          </label>
        )}
        <textarea id={id} ref={ref} className={textareaClass} {...props} />
        {error && (
          <p className="text-[10px] text-error font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
