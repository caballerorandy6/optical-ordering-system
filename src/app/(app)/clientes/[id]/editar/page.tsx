import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/customers/customer-form";

export const metadata: Metadata = { title: "Editar cliente" };

export default async function EditarClientePage({
  params,
}: PageProps<"/clientes/[id]/editar">) {
  await requireUser();
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Editar cliente</h1>
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
