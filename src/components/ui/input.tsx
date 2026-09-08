import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-brand-focus focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-focus disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-brand-risk focus:border-brand-risk focus:ring-brand-risk",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-brand-risk">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium uppercase tracking-wider text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-brand-focus focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-focus disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-brand-risk focus:border-brand-risk focus:ring-brand-risk",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-brand-risk">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
