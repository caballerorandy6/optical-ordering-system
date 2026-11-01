"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { demoWriteBlocked } from "@/lib/demo-guard";
import { requireUser } from "@/lib/session";
import { customerSchema, type CustomerInput } from "@/lib/validations";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function toCustomerData(data: CustomerInput) {
  return {
    nombre: data.nombre,
    apellido: data.apellido,
    telefono: data.telefono || null,
    celular: data.celular || null,
    direccion: data.direccion || null,
    fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
    notas: data.notas || null,
  };
}

export async function createCustomer(input: CustomerInput): Promise<ActionResult> {
  const blocked = await demoWriteBlocked();
  if (blocked) return blocked;
  await requireUser();
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const customer = await prisma.customer.create({ data: toCustomerData(parsed.data) });
  revalidatePath("/clientes");
  return { ok: true, id: customer.id };
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<ActionResult> {
  const blocked = await demoWriteBlocked();
  if (blocked) return blocked;
  await requireUser();
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  await prisma.customer.update({ where: { id }, data: toCustomerData(parsed.data) });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { ok: true, id };
}
