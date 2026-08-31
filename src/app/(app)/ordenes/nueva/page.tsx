import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderForm } from "@/components/orders/order-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("newOrder") };
}

export default async function NuevaOrdenPage({
  searchParams,
}: PageProps<"/ordenes/nueva">) {
  await requireUser();
  const t = await getTranslations("orderForm");
  const sp = await searchParams;
  const preselected = typeof sp.cliente === "string" ? sp.cliente : undefined;

  const customers = await prisma.customer.findMany({
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, apellido: true, telefono: true, celular: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <OrderForm
        preselectedCustomerId={preselected}
        customers={customers.map((c) => ({
          id: c.id,
          label: `${c.apellido}, ${c.nombre}${c.celular || c.telefono ? ` — ${c.celular ?? c.telefono}` : ""}`,
        }))}
      />
    </div>
  );
}
