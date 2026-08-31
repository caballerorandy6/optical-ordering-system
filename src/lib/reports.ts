import "server-only";

import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/money";
import type { PaymentMethodKey } from "@/lib/catalogs";

export type DateRange = { desde: Date; hasta: Date };

/** Rango [desde 00:00, hasta 23:59:59] en hora local del servidor. */
export function parseRange(desde?: string, hasta?: string): DateRange {
  const today = new Date();
  const start = desde ? new Date(`${desde}T00:00:00`) : new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = hasta ? new Date(`${hasta}T23:59:59.999`) : new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999);
  return { desde: start, hasta: end };
}

export async function getReportData(range: DateRange, intlLocale = "en-US") {
  const [payments, orders] = await Promise.all([
    prisma.payment.findMany({
      where: { fecha: { gte: range.desde, lte: range.hasta } },
      select: {
        fecha: true,
        monto: true,
        metodo: true,
        user: { select: { name: true } },
        order: { select: { folio: true } },
      },
      orderBy: { fecha: "asc" },
    }),
    prisma.order.findMany({
      where: {
        fecha: { gte: range.desde, lte: range.hasta },
        estado: { not: "CANCELADA" },
      },
      select: { total: true, user: { select: { name: true } } },
    }),
  ]);

  // Cobrado por día
  const porDia = new Map<string, { count: number; totalCents: number }>();
  for (const p of payments) {
    const key = new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium" }).format(p.fecha);
    const entry = porDia.get(key) ?? { count: 0, totalCents: 0 };
    entry.count += 1;
    entry.totalCents += toCents(p.monto.toString());
    porDia.set(key, entry);
  }

  // Cierre de caja por método
  const porMetodo = new Map<PaymentMethodKey, { count: number; totalCents: number }>();
  for (const p of payments) {
    const entry = porMetodo.get(p.metodo) ?? { count: 0, totalCents: 0 };
    entry.count += 1;
    entry.totalCents += toCents(p.monto.toString());
    porMetodo.set(p.metodo, entry);
  }

  // Vendido por vendedor (Sold By): órdenes creadas en el rango
  const porVendedor = new Map<string, { ordenes: number; vendidoCents: number }>();
  for (const o of orders) {
    const entry = porVendedor.get(o.user.name) ?? { ordenes: 0, vendidoCents: 0 };
    entry.ordenes += 1;
    entry.vendidoCents += toCents(o.total.toString());
    porVendedor.set(o.user.name, entry);
  }

  // Cobrado por quien registró el pago
  const cobradoPor = new Map<string, number>();
  for (const p of payments) {
    cobradoPor.set(p.user.name, (cobradoPor.get(p.user.name) ?? 0) + toCents(p.monto.toString()));
  }

  const totalCobradoCents = payments.reduce((acc, p) => acc + toCents(p.monto.toString()), 0);
  const totalVendidoCents = orders.reduce((acc, o) => acc + toCents(o.total.toString()), 0);

  return {
    payments,
    porDia,
    porMetodo,
    porVendedor,
    cobradoPor,
    totalCobradoCents,
    totalVendidoCents,
    numOrdenes: orders.length,
  };
}
