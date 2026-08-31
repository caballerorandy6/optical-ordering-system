import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/session";
import { parseRange, getReportData } from "@/lib/reports";
import { formatUSD } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  return { title: t("reports") };
}

function toInputDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function ReportesPage({ searchParams }: PageProps<"/reportes">) {
  await requireUser();
  const t = await getTranslations("reports");
  const tc = await getTranslations("catalogs");
  const tcommon = await getTranslations("common");
  const locale = await getLocale();
  const intlLocale = locale === "en" ? "en-US" : "es-US";
  const sp = await searchParams;
  const desdeStr = typeof sp.desde === "string" ? sp.desde : undefined;
  const hastaStr = typeof sp.hasta === "string" ? sp.hasta : undefined;
  const range = parseRange(desdeStr, hastaStr);
  const data = await getReportData(range, intlLocale);

  const exportQs = `desde=${toInputDate(range.desde)}&hasta=${toInputDate(range.hasta)}`;
  const dateFmt = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button variant="outline" asChild>
          <a href={`/reportes/export?${exportQs}`}>
            <Download className="size-4" aria-hidden /> {t("exportCsv")}
          </a>
        </Button>
      </div>

      {/* Filtro de rango */}
      <form className="flex flex-wrap items-end gap-3" method="GET">
        <div className="space-y-1">
          <Label htmlFor="desde">{t("from")}</Label>
          <Input
            id="desde"
            type="date"
            name="desde"
            defaultValue={toInputDate(range.desde)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hasta">{t("to")}</Label>
          <Input
            id="hasta"
            type="date"
            name="hasta"
            defaultValue={toInputDate(range.hasta)}
            className="w-40"
          />
        </div>
        <Button type="submit" variant="secondary">
          {t("apply")}
        </Button>
      </form>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("ordersCreated")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.numOrdenes}</p>
            <p className="text-sm text-muted-foreground">
              {t("sold", { amount: formatUSD(data.totalVendidoCents) })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("collected")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatUSD(data.totalCobradoCents)}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("paymentsCount", { count: data.payments.length })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("range")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {dateFmt.format(range.desde)} — {dateFmt.format(range.hasta)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cierre de caja por método */}
        <Card>
          <CardHeader>
            <CardTitle>{t("cashClosingByMethod")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("method")}</TableHead>
                  <TableHead className="text-right">{t("numPayments")}</TableHead>
                  <TableHead className="text-right">{tcommon("total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.porMetodo.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {t("noPaymentsInRange")}
                    </TableCell>
                  </TableRow>
                )}
                {[...data.porMetodo.entries()].map(([metodo, v]) => (
                  <TableRow key={metodo}>
                    <TableCell className="font-medium">
                      {tc(`paymentMethods.${metodo}`)}
                    </TableCell>
                    <TableCell className="text-right">{v.count}</TableCell>
                    <TableCell className="text-right">{formatUSD(v.totalCents)}</TableCell>
                  </TableRow>
                ))}
                {data.porMetodo.size > 0 && (
                  <TableRow className="font-semibold">
                    <TableCell>{tcommon("total")}</TableCell>
                    <TableCell className="text-right">{data.payments.length}</TableCell>
                    <TableCell className="text-right">
                      {formatUSD(data.totalCobradoCents)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cobrado por día */}
        <Card>
          <CardHeader>
            <CardTitle>{t("collectedByDay")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("day")}</TableHead>
                  <TableHead className="text-right">{t("numPayments")}</TableHead>
                  <TableHead className="text-right">{tcommon("total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.porDia.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {t("noPaymentsInRange")}
                    </TableCell>
                  </TableRow>
                )}
                {[...data.porDia.entries()].map(([dia, v]) => (
                  <TableRow key={dia}>
                    <TableCell className="font-medium">{dia}</TableCell>
                    <TableCell className="text-right">{v.count}</TableCell>
                    <TableCell className="text-right">{formatUSD(v.totalCents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Ventas por vendedor */}
        <Card>
          <CardHeader>
            <CardTitle>{t("salesBySeller")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("seller")}</TableHead>
                  <TableHead className="text-right">{t("numOrders")}</TableHead>
                  <TableHead className="text-right">{t("soldColumn")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.porVendedor.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {t("noOrdersInRange")}
                    </TableCell>
                  </TableRow>
                )}
                {[...data.porVendedor.entries()].map(([nombre, v]) => (
                  <TableRow key={nombre}>
                    <TableCell className="font-medium">{nombre}</TableCell>
                    <TableCell className="text-right">{v.ordenes}</TableCell>
                    <TableCell className="text-right">{formatUSD(v.vendidoCents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cobrado por usuario */}
        <Card>
          <CardHeader>
            <CardTitle>{t("collectedByUser")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead className="text-right">{t("totalCollected")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.cobradoPor.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      {t("noPaymentsInRange")}
                    </TableCell>
                  </TableRow>
                )}
                {[...data.cobradoPor.entries()].map(([nombre, cents]) => (
                  <TableRow key={nombre}>
                    <TableCell className="font-medium">{nombre}</TableCell>
                    <TableCell className="text-right">{formatUSD(cents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
