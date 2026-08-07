"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/session";
import { paymentSchema, type PaymentInput } from "@/lib/validations";
import { calcBalanceDueCents, toCents } from "@/lib/money";
import type { ActionResult } from "@/actions/customers";

export async function addPayment(input: PaymentInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    select: { id: true, total: true, estado: true, payments: { select: { monto: true } } },
  });
  if (!order) return { ok: false, error: "Orden no encontrada" };
  if (order.estado === "CANCELADA") {
    return { ok: false, error: "No se pueden registrar abonos en una orden cancelada" };
  }

  const balance = calcBalanceDueCents(
    toCents(order.total.toString()),
    order.payments.map((p) => p.monto.toString())
  );
  if (toCents(data.monto) > balance) {
    return { ok: false, error: "El abono excede el balance pendiente" };
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId: data.orderId,
        monto: Number(data.monto).toFixed(2),
        metodo: data.metodo,
        userId: user.id,
        nota: data.nota || null,
      },
    });
    await tx.auditLog.create({
      data: { userId: user.id, accion: "ABONO", entidad: "Payment", entidadId: payment.id },
    });
  });

  revalidatePath(`/ordenes/${data.orderId}`);
  revalidatePath("/ordenes");
  return { ok: true };
}

/** Los pagos son inmutables para STAFF: solo ADMIN corrige (elimina) un pago. */
export async function deletePayment(paymentId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { ok: false, error: "Pago no encontrado" };

  await prisma.$transaction([
    prisma.payment.delete({ where: { id: paymentId } }),
    prisma.auditLog.create({
      data: {
        userId: admin.id,
        accion: "CORREGIR_PAGO",
        entidad: "Payment",
        entidadId: paymentId,
      },
    }),
  ]);

  revalidatePath(`/ordenes/${payment.orderId}`);
  revalidatePath("/ordenes");
  return { ok: true };
}
