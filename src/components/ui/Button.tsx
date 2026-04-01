import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sol disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-terra text-texto shadow-button-glow hover:bg-acento",
        sol: "bg-sol text-noite hover:bg-sol/90",
        outline: "border border-borda bg-transparent hover:bg-borda text-texto",
        secondary: "bg-superficie text-texto hover:bg-borda",
        ghost: "hover:bg-borda text-texto",
        link: "text-sol underline-offset-4 hover:underline",
        gradient: "terra-gradient text-texto shadow-button-glow hover:opacity-90",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-badge px-3 text-xs",
        lg: "h-12 rounded-button px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
