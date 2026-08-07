import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCustomerWithOrders } from "@/lib/queries";
import { formatUSD } from "@/lib/money";
import { ORDER_STATUS } from "@/lib/catalogs";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Cliente" };

export default async function ClientePage({ params }: PageProps<"/clientes/[id]">) {
  await requireUser();
  const { id } = await params;
  const customer = await getCustomerWithOrders(id);
  if (!customer) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">
          {customer.apellido}, {customer.nombre}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/clientes/${customer.id}/editar`}>
              <Pencil className="size-4" aria-hidden /> Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/ordenes/nueva?cliente=${customer.id}`}>
              <Plus className="size-4" aria-hidden /> Nueva orden
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Tel: {customer.telefono ?? "—"}</p>
            <p>Cel: {customer.celular ?? "—"}</p>
            <p className="text-muted-foreground">{customer.direccion ?? ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Nacimiento</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {customer.fechaNacimiento
              ? new Intl.DateTimeFormat("es-US", { dateStyle: "long", timeZone: "UTC" }).format(
                  customer.fechaNacimiento
                )
              : "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Balance pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold ${
                customer.balanceTotalCents > 0 ? "text-destructive" : "text-emerald-600"
              }`}
            >
              {formatUSD(customer.balanceTotalCents)}
            </p>
          </CardContent>
        </Card>
      </div>

      {customer.notas && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Notas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{customer.notas}</CardContent>
        </Card>
      )}

      <h2 className="pt-2 text-lg font-semibold">Historial de órdenes</h2>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customer.orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Este cliente aún no tiene órdenes
                </TableCell>
              </TableRow>
            )}
            {customer.orders.map((o) => (
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
