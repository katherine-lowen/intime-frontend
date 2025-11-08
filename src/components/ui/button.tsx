// src/components/ui/button.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "icon";
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "default", size = "md", ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none border";
  const variants = {
    default: "bg-black text-white border-black hover:opacity-90",
    outline: "bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50",
  };
  const sizes = {
    sm: "h-8 px-3",
    md: "h-9 px-4",
    icon: "h-9 w-9 p-0",
  };
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
