import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listOrders, type OrderListFilter } from "@/lib/queries";
import { formatUSD } from "@/lib/money";
import { ORDER_STATUS } from "@/lib/catalogs";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { CustomerSearch } from "@/components/customers/customer-search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Órdenes" };

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "todas", label: "Todas" },
  { key: "balance", label: "Con balance" },
  { key: "ABIERTA", label: "Abiertas" },
  { key: "LISTA", label: "Listas" },
  { key: "ENTREGADA", label: "Entregadas" },
  { key: "CANCELADA", label: "Canceladas" },
];

export default async function OrdenesPage({ searchParams }: PageProps<"/ordenes">) {
  await requireUser();
  const sp = await searchParams;
  const filtro = typeof sp.filtro === "string" ? sp.filtro : "todas";
  const q = typeof sp.q === "string" ? sp.q : "";

  const filter: OrderListFilter = { q: q || undefined };
  if (filtro === "balance") filter.conBalance = true;
  else if (filtro !== "todas")
    filter.estado = filtro as NonNullable<OrderListFilter["estado"]>;

  const orders = await listOrders(filter);
  const totalBalanceCents = orders.reduce((acc, o) => acc + o.balanceCents, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Órdenes</h1>
        <Button asChild>
          <Link href="/ordenes/nueva">
            <Plus className="size-4" aria-hidden /> Nueva orden
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            variant={filtro === f.key ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/ordenes?filtro=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
              {f.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <CustomerSearch placeholder="Buscar por cliente o folio..." />
        {filtro === "balance" && (
          <Badge variant="secondary" className="text-sm">
            Total pendiente: {formatUSD(totalBalanceCents)}
          </Badge>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Vendido por</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay órdenes con este filtro
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link
                    href={`/ordenes/${o.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    #{o.folio}
                  </Link>
                </TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("es-US", { dateStyle: "medium" }).format(o.fecha)}
                </TableCell>
                <TableCell>{o.cliente}</TableCell>
                <TableCell className="hidden md:table-cell">{o.vendedor}</TableCell>
                <TableCell>
                  <OrderStatusBadge estado={o.estado} label={ORDER_STATUS[o.estado]} />
                </TableCell>
                <TableCell className="text-right">{formatUSD(o.totalCents)}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    o.balanceCents > 0 ? "text-destructive" : ""
                  }`}
                >
                  {formatUSD(o.balanceCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
