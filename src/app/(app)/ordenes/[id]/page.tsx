import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Printer } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOrderDetail } from "@/lib/queries";
import { formatUSD, toCents } from "@/lib/money";
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
  const t = await getTranslations("orderDetail");
  const tc = await getTranslations("catalogs");
  const tcommon = await getTranslations("common");
  const locale = await getLocale();
  const intlLocale = locale === "en" ? "en-US" : "es-US";
  const { id } = await params;
  const detail = await getOrderDetail(id);
  if (!detail) notFound();
  const { order, totalCents, subtotalCents, balanceCents } = detail;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{t("title", { folio: order.folio })}</h1>
          <p className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat(intlLocale, { dateStyle: "long" }).format(order.fecha)} ·{" "}
            {t("soldBy", { name: order.user.name })}
            {order.refCia ? ` · REF/CIA: ${order.refCia}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusSelect orderId={order.id} estado={order.estado} isAdmin={isAdmin} />
          <Button variant="outline" asChild>
            <a href={`/ordenes/${order.id}/pdf`} target="_blank" rel="noopener">
              <Printer className="size-4" aria-hidden /> {tcommon("print")}
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">{t("customer")}</CardTitle>
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
              {order.customer.celular ?? order.customer.telefono ?? t("noPhone")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t("pendingBalance")}</p>
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
            <CardTitle>{t("rx")}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-175 border-collapse text-sm">
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
              <CardTitle>{t("lenses")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">{t("type")}</span>{" "}
                {tc(`lensTypes.${order.lensConfig.tipo}`)}
                {order.lensConfig.subtipo ? ` — ${order.lensConfig.subtipo}` : ""}
                {order.lensConfig.estiloProgresivo
                  ? ` (${order.lensConfig.estiloProgresivo})`
                  : ""}
              </p>
              {order.lensConfig.material && (
                <p>
                  <span className="text-muted-foreground">{t("material")}</span>{" "}
                  {tc(`materials.${order.lensConfig.material}`)}
                </p>
              )}
              {order.lensConfig.lensColor && (
                <p>
                  <span className="text-muted-foreground">{t("color")}</span>{" "}
                  {order.lensConfig.lensColor}
                  {order.lensConfig.colorStyle
                    ? ` (${tc(`colorStyles.${order.lensConfig.colorStyle}`)})`
                    : ""}
                </p>
              )}
              {order.lensConfig.tratamientos.length > 0 && (
                <p>
                  <span className="text-muted-foreground">{t("treatments")}</span>{" "}
                  {order.lensConfig.tratamientos
                    .map((tr) => tc(`treatments.${tr}`))
                    .join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {order.frame && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t("frame")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">{t("measurements")}</span>{" "}
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
                <span className="text-muted-foreground">{t("brandStyle")}</span>{" "}
                {[order.frame.company, order.frame.style, order.frame.color]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">{t("type")}</span>{" "}
                {order.frame.tipo ? tc(`frameTypes.${order.frame.tipo}`) : "—"}
                {order.frame.ownFrame && ` · ${t("ownFrame")}`}
                {order.frame.toCome && ` · ${t("toCome")}`}
                {order.frame.lensesOnly && ` · ${t("lensesOnly")}`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {order.contactLenses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("contactLenses")}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("eye")}</TableHead>
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
          <CardTitle>{t("chargesAndBalance")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("concept")}</TableHead>
                <TableHead>{t("description")}</TableHead>
                <TableHead className="text-right">{t("amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.charges.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {tc(`chargeConcepts.${c.concepto}`)}
                  </TableCell>
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
              <span className="text-muted-foreground">{tcommon("subtotal")}</span>
              <span>{formatUSD(subtotalCents)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{tcommon("total")}</span>
              <span>{formatUSD(totalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tcommon("paid")}</span>
              <span>{formatUSD(totalCents - balanceCents)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>{tcommon("balance")}</span>
              <span className={balanceCents > 0 ? "text-destructive" : "text-emerald-600"}>
                {formatUSD(balanceCents)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t("payments")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tcommon("date")}</TableHead>
                <TableHead>{t("method")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("collectedBy")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("note")}</TableHead>
                <TableHead className="text-right">{t("amount")}</TableHead>
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
                    {t("noPayments")}
                  </TableCell>
                </TableRow>
              )}
              {order.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {new Intl.DateTimeFormat(intlLocale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(p.fecha)}
                  </TableCell>
                  <TableCell>{tc(`paymentMethods.${p.metodo}`)}</TableCell>
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
                <p className="mb-1 font-medium">{tcommon("notes")}</p>
                <p className="text-muted-foreground">{order.notas}</p>
              </div>
            )}
            {order.instruccionesEspeciales && (
              <div>
                <p className="mb-1 font-medium">{t("specialInstructions")}</p>
                <p className="text-muted-foreground">{order.instruccionesEspeciales}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
