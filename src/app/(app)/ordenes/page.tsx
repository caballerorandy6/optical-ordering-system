import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { listOrders, type OrderListFilter } from "@/lib/queries";
import { formatUSD } from "@/lib/money";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("orders") };
}

const FILTERS = [
  { key: "todas", labelKey: "filterAll" },
  { key: "balance", labelKey: "filterWithBalance" },
  { key: "ABIERTA", labelKey: "filterOpen" },
  { key: "LISTA", labelKey: "filterReady" },
  { key: "ENTREGADA", labelKey: "filterDelivered" },
  { key: "CANCELADA", labelKey: "filterCancelled" },
] as const;

export default async function OrdenesPage({ searchParams }: PageProps<"/ordenes">) {
  await requireUser();
  const t = await getTranslations("orders");
  const tc = await getTranslations("catalogs");
  const tcommon = await getTranslations("common");
  const locale = await getLocale();
  const sp = await searchParams;
  const filtro = typeof sp.filtro === "string" ? sp.filtro : "todas";
  const q = typeof sp.q === "string" ? sp.q : "";

  const filter: OrderListFilter = { q: q || undefined };
  if (filtro === "balance") filter.conBalance = true;
  else if (filtro !== "todas")
    filter.estado = filtro as NonNullable<OrderListFilter["estado"]>;

  const orders = await listOrders(filter);
  const totalBalanceCents = orders.reduce((acc, o) => acc + o.balanceCents, 0);
  const dateFmt = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-US", {
    dateStyle: "medium",
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button asChild>
          <Link href="/ordenes/nueva">
            <Plus className="size-4" aria-hidden /> {t("new")}
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
              {t(f.labelKey)}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <CustomerSearch placeholder={t("searchPlaceholder")} />
        {filtro === "balance" && (
          <Badge variant="secondary" className="text-sm">
            {t("totalPending", { amount: formatUSD(totalBalanceCents) })}
          </Badge>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("folio")}</TableHead>
              <TableHead>{tcommon("date")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("soldBy")}</TableHead>
              <TableHead>{tcommon("status")}</TableHead>
              <TableHead className="text-right">{tcommon("total")}</TableHead>
              <TableHead className="text-right">{tcommon("balance")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t("empty")}
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
                <TableCell>{dateFmt.format(o.fecha)}</TableCell>
                <TableCell>{o.cliente}</TableCell>
                <TableCell className="hidden md:table-cell">{o.vendedor}</TableCell>
                <TableCell>
                  <OrderStatusBadge estado={o.estado} label={tc(`orderStatus.${o.estado}`)} />
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
