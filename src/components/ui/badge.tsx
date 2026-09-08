import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors gap-1.5 border select-none",
  {
    variants: {
      variant: {
        growth: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
        focus: "bg-blue-950/60 text-blue-400 border-blue-800/60",
        warning: "bg-amber-950/60 text-amber-400 border-amber-800/60",
        risk: "bg-rose-950/60 text-rose-400 border-rose-800/60",
        neutral: "bg-surface-subtle text-text-secondary border-border-subtle",
        outline: "text-text-primary border-border-subtle bg-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
