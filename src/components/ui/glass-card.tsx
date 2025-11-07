import { cn } from "@/lib/cn";

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line-subtle/60 bg-white/70 backdrop-blur-xl shadow-card dark:bg-white/5 dark:border-white/10",
        className
      )}
    >
      {children}
    </div>
  );
}
