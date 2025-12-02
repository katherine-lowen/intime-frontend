// src/components/ui/card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-100 bg-white shadow-card",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3",
        className,
      )}
      {...rest}
    />
  );
}

export function CardTitle(
  props: React.HTMLAttributes<HTMLHeadingElement>
) {
  const { className, ...rest } = props;
  return (
    <h3
      className={cn(
        "text-sm font-semibold leading-tight text-neutral-900",
        className,
      )}
      {...rest}
    />
  );
}

export function CardDescription(
  props: React.HTMLAttributes<HTMLParagraphElement>
) {
  const { className, ...rest } = props;
  return (
      <p
        className={cn(
          "text-xs leading-relaxed text-neutral-600",
          className,
        )}
        {...rest}
      />
  );
}

export function CardContent(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn("px-4 py-4", className)}
      {...rest}
    />
  );
}

export function CardFooter(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 px-4 pb-4 pt-0",
        className,
      )}
      {...rest}
    />
  );
}
