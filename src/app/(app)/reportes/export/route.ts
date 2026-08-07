import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { parseRange, getReportData } from "@/lib/reports";
import { PAYMENT_METHODS } from "@/lib/catalogs";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("No autorizado", { status: 401 });

  const url = new URL(request.url);
  const range = parseRange(
    url.searchParams.get("desde") ?? undefined,
    url.searchParams.get("hasta") ?? undefined
  );
  const data = await getReportData(range);

  const rows = [
    ["Fecha", "Folio", "Método", "Cobró", "Monto"],
    ...data.payments.map((p) => [
      new Intl.DateTimeFormat("es-US", { dateStyle: "short", timeStyle: "short" }).format(
        p.fecha
      ),
      `#${p.order.folio}`,
      PAYMENT_METHODS[p.metodo],
      p.user.name,
      p.monto.toString(),
    ]),
  ];

  const csv = "﻿" + rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const nombre = `pagos_${range.desde.toISOString().slice(0, 10)}_${range.hasta
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "no-store",
    },
  });
}
