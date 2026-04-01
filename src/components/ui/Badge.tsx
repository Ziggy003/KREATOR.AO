import * as React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "sol" | "outline" | "success" | "destructive" }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-terra text-texto",
    sol: "bg-sol text-noite",
    outline: "border border-borda text-texto",
    success: "bg-verde text-noite",
    destructive: "bg-red-500 text-white",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-badge px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sol focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
