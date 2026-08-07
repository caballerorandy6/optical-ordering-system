import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  ABIERTA: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  LISTA: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200",
  ENTREGADA: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  CANCELADA: "bg-zinc-200 text-zinc-600 line-through dark:bg-zinc-800 dark:text-zinc-400",
};

export function OrderStatusBadge({ estado, label }: { estado: string; label: string }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", STYLES[estado])}>
      {label}
    </Badge>
  );
}
