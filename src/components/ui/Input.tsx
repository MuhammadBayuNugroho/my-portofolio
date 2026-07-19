import React, { useRef, useEffect, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// INPUT — Premium input with high-contrast borders and states
// ─────────────────────────────────────────────────────────────────

interface InputBaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export type InputProps = InputBaseProps &
  React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, helperText, id, className, wrapperClassName, disabled, iconLeft, iconRight, ...props }, ref) {
    const inputClass = cn(
      "w-full rounded-lg border bg-background py-2.5 text-xs text-foreground transition-all duration-200",
      "placeholder:text-foreground-subtle/70 px-3.5",
      "border-zinc-300 dark:border-zinc-600",
      "hover:border-zinc-400 dark:hover:border-zinc-400",
      "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
      disabled && "opacity-50 cursor-not-allowed bg-background-overlay/30 border-zinc-200 dark:border-zinc-700",
      error && "border-error hover:border-error focus:ring-error/20 focus:border-error",
      iconLeft && "pl-10",
      iconRight && "pr-10",
      className
    );

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-foreground-muted select-none">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          {iconLeft && (
            <div className="absolute left-3.5 text-foreground-subtle/70 flex items-center justify-center pointer-events-none">
              {iconLeft}
            </div>
          )}
          <input id={id} ref={ref} disabled={disabled} className={inputClass} {...props} />
          {iconRight && (
            <div className="absolute right-3.5 text-foreground-subtle/70 flex items-center justify-center">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[10px] text-error font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[10px] text-foreground-subtle">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─────────────────────────────────────────────────────────────────
// TEXTAREA — Auto-resizing textarea with character counter
// ─────────────────────────────────────────────────────────────────

interface TextareaBaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  showCounter?: boolean;
  wrapperClassName?: string;
}

export type TextareaProps = TextareaBaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, helperText, showCounter = false, id, className, wrapperClassName, disabled, ...props },
    ref
  ) {
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    // Expose localRef to parent ref
    useImperativeHandle(ref, () => localRef.current!);

    const adjustHeight = () => {
      const textarea = localRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight + 2}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const textareaClass = cn(
      "w-full rounded-lg border bg-background px-3.5 py-2.5 text-xs text-foreground min-h-[80px] transition-all duration-200",
      "placeholder:text-foreground-subtle/70",
      "border-zinc-300 dark:border-zinc-600",
      "hover:border-zinc-400 dark:hover:border-zinc-400",
      "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
      disabled && "opacity-50 cursor-not-allowed bg-background-overlay/30 border-zinc-200 dark:border-zinc-700",
      error && "border-error hover:border-error focus:ring-error/20 focus:border-error",
      className
    );

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-foreground-muted select-none">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={localRef}
          disabled={disabled}
          className={textareaClass}
          {...props}
          onChange={handleChange}
        />
        <div className="flex justify-between items-start gap-2 mt-0.5">
          {error ? (
            <p className="text-[10px] text-error font-medium">{error}</p>
          ) : helperText ? (
            <p className="text-[10px] text-foreground-subtle">{helperText}</p>
          ) : (
            <div />
          )}
          {showCounter && props.maxLength && (
            <p className="text-[10px] text-foreground-subtle font-medium shrink-0 ml-auto">
              {String(props.value || "").length} / {props.maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

