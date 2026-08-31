import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/customers/customer-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("editCustomer") };
}

export default async function EditarClientePage({
  params,
}: PageProps<"/clientes/[id]/editar">) {
  await requireUser();
  const t = await getTranslations("customers");
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">{t("editTitle")}</h1>
      <CustomerForm
        customerId={customer.id}
        defaultValues={{
          nombre: customer.nombre,
          apellido: customer.apellido,
          telefono: customer.telefono ?? "",
          celular: customer.celular ?? "",
          direccion: customer.direccion ?? "",
          fechaNacimiento: customer.fechaNacimiento
            ? customer.fechaNacimiento.toISOString().slice(0, 10)
            : "",
          notas: customer.notas ?? "",
        }}
      />
    </div>
  );
}
