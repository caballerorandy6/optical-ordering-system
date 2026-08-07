import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOrderDetail } from "@/lib/queries";
import { formatUSD, toCents } from "@/lib/money";
import {
  ORDER_STATUS,
  LENS_TYPES,
  LENS_MATERIALS,
  LENS_TREATMENTS,
  LENS_COLOR_STYLES,
  FRAME_TYPES,
  CHARGE_CONCEPTS,
  PAYMENT_METHODS,
} from "@/lib/catalogs";
import { OrderStatusSelect } from "@/components/orders/order-status-select";
import { PaymentForm } from "@/components/orders/payment-form";
import { DeletePaymentButton } from "@/components/orders/delete-payment-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Orden" };

const RX_COLS = [
  ["sphere", "Sphere"],
  ["cylinder", "Cylinder"],
  ["axis", "Axis"],
  ["prism", "Prism"],
  ["base", "Base"],
  ["far", "Far"],
  ["near", "Near"],
  ["add", "Add"],
  ["segHeight", "Seg.Ht"],
] as const;

export default async function OrdenPage({ params }: PageProps<"/ordenes/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const detail = await getOrderDetail(id);
  if (!detail) notFound();
  const { order, totalCents, subtotalCents, balanceCents } = detail;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Orden #{order.folio}</h1>
          <p className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("es-US", { dateStyle: "long" }).format(order.fecha)} ·
            Vendido por {order.user.name}
            {order.refCia ? ` · REF/CIA: ${order.refCia}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusSelect orderId={order.id} estado={order.estado} isAdmin={isAdmin} />
          <Button variant="outline" asChild>
            <a href={`/ordenes/${order.id}/pdf`} target="_blank" rel="noopener">
              <Printer className="size-4" aria-hidden /> Imprimir
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Cliente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Link
              href={`/clientes/${order.customer.id}`}
              className="font-medium text-primary hover:underline"
            >
              {order.customer.apellido}, {order.customer.nombre}
            </Link>
            <p className="text-sm text-muted-foreground">
              {order.customer.celular ?? order.customer.telefono ?? "Sin teléfono"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Balance pendiente</p>
            <p
              className={`text-2xl font-bold ${
                balanceCents > 0 ? "text-destructive" : "text-emerald-600"
              }`}
            >
              {formatUSD(balanceCents)}
            </p>
          </div>
        </CardContent>
      </Card>

      {order.prescriptions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Prescripción (Rx)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-12 border bg-muted p-1"> </th>
                  {RX_COLS.map(([key, label]) => (
                    <th key={key} className="border bg-muted p-1 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.prescriptions.map((p) => (
                  <tr key={p.id}>
                    <td className="border bg-muted p-1 text-center font-semibold">
                      {p.ojo === "OD" ? "R" : "L"}
                    </td>
                    {RX_COLS.map(([key]) => (
                      <td key={key} className="border p-1 text-center">
                        {p[key] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {order.lensConfig && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Lentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Tipo:</span>{" "}
                {LENS_TYPES[order.lensConfig.tipo]}
                {order.lensConfig.subtipo ? ` — ${order.lensConfig.subtipo}` : ""}
                {order.lensConfig.estiloProgresivo
                  ? ` (${order.lensConfig.estiloProgresivo})`
                  : ""}
              </p>
              {order.lensConfig.material && (
                <p>
                  <span className="text-muted-foreground">Material:</span>{" "}
                  {LENS_MATERIALS[order.lensConfig.material]}
                </p>
              )}
              {order.lensConfig.lensColor && (
                <p>
                  <span className="text-muted-foreground">Color:</span>{" "}
                  {order.lensConfig.lensColor}
                  {order.lensConfig.colorStyle
                    ? ` (${LENS_COLOR_STYLES[order.lensConfig.colorStyle]})`
                    : ""}
                </p>
              )}
              {order.lensConfig.tratamientos.length > 0 && (
                <p>
                  <span className="text-muted-foreground">Tratamientos:</span>{" "}
                  {order.lensConfig.tratamientos.map((t) => LENS_TREATMENTS[t]).join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {order.frame && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Montura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Medidas:</span>{" "}
                {[
                  order.frame.eyeSize && `Eye ${order.frame.eyeSize}`,
                  order.frame.bridge && `Bridge ${order.frame.bridge}`,
                  order.frame.temple && `Temple ${order.frame.temple}`,
                  order.frame.vertical && `Vert ${order.frame.vertical}`,
                  order.frame.ed && `E.D. ${order.frame.ed}`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Marca/Estilo:</span>{" "}
                {[order.frame.company, order.frame.style, order.frame.color]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Tipo:</span>{" "}
                {order.frame.tipo ? FRAME_TYPES[order.frame.tipo] : "—"}
                {order.frame.ownFrame && " · Montura propia"}
                {order.frame.toCome && " · Por llegar"}
                {order.frame.lensesOnly && " · Solo micas"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {order.contactLenses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lentes de contacto</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ojo</TableHead>
                  <TableHead>B.C.</TableHead>
                  <TableHead>DIA</TableHead>
                  <TableHead>Power</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Marca</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.contactLenses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.ojo}</TableCell>
                    <TableCell>{c.bc ?? "—"}</TableCell>
                    <TableCell>{c.dia ?? "—"}</TableCell>
                    <TableCell>{c.power ?? "—"}</TableCell>
                    <TableCell>{c.color ?? "—"}</TableCell>
                    <TableCell>{c.marca ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Cargos y balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.charges.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{CHARGE_CONCEPTS[c.concepto]}</TableCell>
                  <TableCell className="text-muted-foreground">{c.descripcion ?? ""}</TableCell>
                  <TableCell className="text-right">
                    {formatUSD(toCents(c.monto.toString()))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatUSD(subtotalCents)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatUSD(totalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagado</span>
              <span>{formatUSD(totalCents - balanceCents)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Balance</span>
              <span className={balanceCents > 0 ? "text-destructive" : "text-emerald-600"}>
                {formatUSD(balanceCents)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Pagos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="hidden md:table-cell">Cobró</TableHead>
                <TableHead className="hidden md:table-cell">Nota</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                {isAdmin && <TableHead className="w-10"> </TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.payments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
                    className="text-center text-muted-foreground"
                  >
                    Sin pagos registrados
                  </TableCell>
                </TableRow>
              )}
              {order.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {new Intl.DateTimeFormat("es-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(p.fecha)}
                  </TableCell>
                  <TableCell>{PAYMENT_METHODS[p.metodo]}</TableCell>
                  <TableCell className="hidden md:table-cell">{p.user.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {p.nota ?? ""}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatUSD(toCents(p.monto.toString()))}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <DeletePaymentButton paymentId={p.id} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {balanceCents > 0 && order.estado !== "CANCELADA" && (
            <>
              <Separator />
              <PaymentForm orderId={order.id} />
            </>
          )}
        </CardContent>
      </Card>

      {(order.notas || order.instruccionesEspeciales) && (
        <Card>
          <CardContent className="grid gap-4 pt-6 text-sm md:grid-cols-2">
            {order.notas && (
              <div>
                <p className="mb-1 font-medium">Notas</p>
                <p className="text-muted-foreground">{order.notas}</p>
              </div>
            )}
            {order.instruccionesEspeciales && (
              <div>
                <p className="mb-1 font-medium">Instrucciones especiales</p>
                <p className="text-muted-foreground">{order.instruccionesEspeciales}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
