import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { parseRange, getReportData } from "@/lib/reports";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const [locale, t, tc] = await Promise.all([
    getLocale(),
    getTranslations("reports"),
    getTranslations("catalogs"),
  ]);
  const intlLocale = locale === "es" ? "es-US" : "en-US";

  const url = new URL(request.url);
  const range = parseRange(
    url.searchParams.get("desde") ?? undefined,
    url.searchParams.get("hasta") ?? undefined
  );
  const data = await getReportData(range, intlLocale);

  const rows = [
    [t("csvDate"), t("csvFolio"), t("csvMethod"), t("csvCollectedBy"), t("csvAmount")],
    ...data.payments.map((p) => [
      new Intl.DateTimeFormat(intlLocale, { dateStyle: "short", timeStyle: "short" }).format(
        p.fecha
      ),
      `#${p.order.folio}`,
      tc(`paymentMethods.${p.metodo}`),
      p.user.name,
      p.monto.toString(),
    ]),
  ];

  const csv = "﻿" + rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const filename = `${t("csvFilePrefix")}_${range.desde.toISOString().slice(0, 10)}_${range.hasta
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
