// src/components/ui/button.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "soft" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  function Button({ className, variant = "primary", size = "md", ...props }, ref) {
    const base =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none rounded-full";

    const variants: Record<ButtonVariant, string> = {
      // solid brand pill
      primary:
        "bg-brand-primary text-white hover:bg-brand-primaryDark shadow-sm",

      // white outline
      secondary:
        "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50",

      // soft brand chip
      soft:
        "bg-brand-primarySoft text-brand-primary border border-brand-primary/40 hover:bg-brand-primarySoft/80",

      // destructive
      destructive:
        "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-10 px-5 text-sm",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
