import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorColor = "bg-brand-growth", ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-surface-subtle",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-300 ease-out", indicatorColor)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
