import { cn } from "@/lib/cn";
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}><table className="min-w-full text-sm">{children}</table></div>;
}
export const THead = ({ children }: { children: React.ReactNode }) => (
  <thead className="[&>tr>th]:text-left [&>tr>th]:font-medium [&>tr>th]:text-text-muted">{children}</thead>
);
export const TBody = ({ children }: { children: React.ReactNode }) => (<tbody className="divide-y divide-line-subtle">{children}</tbody>);
export const TR = ({ children, className }: { children: React.ReactNode; className?: string }) => (<tr className={cn("table-row", className)}>{children}</tr>);
export const TH = ({ children, className }: { children: React.ReactNode; className?: string }) => (<th className={cn("px-4 py-3 whitespace-nowrap", className)}>{children}</th>);
export const TD = ({ children, className }: { children: React.ReactNode; className?: string }) => (<td className={cn("px-4 py-3 whitespace-nowrap text-text-soft", className)}>{children}</td>);
