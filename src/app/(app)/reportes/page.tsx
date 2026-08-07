import type { Metadata } from "next";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/session";
import { parseRange, getReportData } from "@/lib/reports";
import { formatUSD } from "@/lib/money";
import { PAYMENT_METHODS } from "@/lib/catalogs";
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

export const metadata: Metadata = { title: "Reportes" };

function toInputDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function ReportesPage({ searchParams }: PageProps<"/reportes">) {
  await requireUser();
  const sp = await searchParams;
  const desdeStr = typeof sp.desde === "string" ? sp.desde : undefined;
  const hastaStr = typeof sp.hasta === "string" ? sp.hasta : undefined;
  const range = parseRange(desdeStr, hastaStr);
  const data = await getReportData(range);

  const exportQs = `desde=${toInputDate(range.desde)}&hasta=${toInputDate(range.hasta)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <Button variant="outline" asChild>
          <a href={`/reportes/export?${exportQs}`}>
            <Download className="size-4" aria-hidden /> Exportar CSV
          </a>
        </Button>
      </div>

      {/* Filtro de rango */}
      <form className="flex flex-wrap items-end gap-3" method="GET">
        <div className="space-y-1">
          <Label htmlFor="desde">Desde</Label>
          <Input
            id="desde"
            type="date"
            name="desde"
            defaultValue={toInputDate(range.desde)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hasta">Hasta</Label>
          <Input
            id="hasta"
            type="date"
            name="hasta"
            defaultValue={toInputDate(range.hasta)}
            className="w-40"
          />
        </div>
        <Button type="submit" variant="secondary">
          Aplicar
        </Button>
      </form>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Órdenes creadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.numOrdenes}</p>
            <p className="text-sm text-muted-foreground">
              Vendido: {formatUSD(data.totalVendidoCents)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cobrado (caja)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatUSD(data.totalCobradoCents)}
            </p>
            <p className="text-sm text-muted-foreground">{data.payments.length} pagos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rango</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {new Intl.DateTimeFormat("es-US", { dateStyle: "medium" }).format(range.desde)} —{" "}
            {new Intl.DateTimeFormat("es-US", { dateStyle: "medium" }).format(range.hasta)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cierre de caja por método */}
        <Card>
          <CardHeader>
            <CardTitle>Cierre de caja por método de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right"># Pagos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.porMetodo.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Sin pagos en el rango
                    </TableCell>
                  </TableRow>
                )}
                {[...data.porMetodo.entries()].map(([metodo, v]) => (
                  <TableRow key={metodo}>
                    <TableCell className="font-medium">{PAYMENT_METHODS[metodo]}</TableCell>
                    <TableCell className="text-right">{v.count}</TableCell>
                    <TableCell className="text-right">{formatUSD(v.totalCents)}</TableCell>
                  </TableRow>
                ))}
                {data.porMetodo.size > 0 && (
                  <TableRow className="font-semibold">
                    <TableCell>Total</TableCell>
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
            <CardTitle>Cobrado por día</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Día</TableHead>
                  <TableHead className="text-right"># Pagos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.porDia.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Sin pagos en el rango
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
            <CardTitle>Ventas por vendedor (Sold By)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right"># Órdenes</TableHead>
                  <TableHead className="text-right">Vendido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.porVendedor.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Sin órdenes en el rango
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
            <CardTitle>Cobrado por usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Total cobrado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.cobradoPor.size === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Sin pagos en el rango
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
