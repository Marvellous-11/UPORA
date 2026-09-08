import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-dark disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-brand-growth text-canvas-dark hover:bg-brand-growth-hover font-semibold shadow-sm",
        focus: "bg-brand-focus text-white hover:bg-brand-focus-hover font-semibold shadow-sm",
        secondary: "bg-surface-subtle text-text-primary hover:bg-surface border border-border-subtle",
        outline: "border border-border-subtle bg-transparent text-text-primary hover:bg-surface-subtle",
        ghost: "hover:bg-surface-subtle text-text-secondary hover:text-text-primary",
        danger: "bg-brand-risk text-white hover:bg-red-700 font-semibold",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 py-2 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
