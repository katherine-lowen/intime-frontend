import { cn } from "@/lib/cn";

type ButtonProps = {
  as?: any;                 // e.g., "a"
  href?: string;            // allow href when as="a"
  className?: string;
  variant?: "primary" | "subtle" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  // allow any other DOM props without complaining
  [key: string]: any;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  as: Tag = "button",
  href,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition select-none disabled:opacity-60 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-brand text-white hover:bg-brand-600 shadow-card active:translate-y-[0.5px]",
    subtle: "bg-surface text-text hover:bg-surface-muted border border-line-subtle",
    ghost: "hover:bg-surface-muted text-text-soft",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3",
    md: "h-9 px-3.5",
    lg: "h-10 px-4 text-[15px]",
  };

  return (
    <Tag
      className={cn(base, variants[variant], sizes[size], className)}
      href={href}
      {...props}
    />
  );
}
