"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/session";
import { orderSchema, orderStatusSchema, type OrderInput } from "@/lib/validations";
import { calcSubtotalCents, centsToDecimalString, toCents } from "@/lib/money";
import type { ActionResult } from "@/actions/customers";

export async function createOrder(input: OrderInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;

  const subtotalCents = calcSubtotalCents(data.charges.map((c) => c.monto));
  const totalCents = subtotalCents; // sin impuestos: anteojos con receta exentos en TX
  const depositoCents = data.deposito ? toCents(data.deposito) : 0;

  const hasRx = (p: (typeof data.prescriptions)[number]) =>
    [p.sphere, p.cylinder, p.axis, p.prism, p.base, p.far, p.near, p.add, p.segHeight].some(
      (v) => v && v !== ""
    );
  const hasCl = (c: (typeof data.contactLenses)[number]) =>
    [c.bc, c.dia, c.power, c.color, c.marca].some((v) => v && v !== "");

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerId: data.customerId,
        userId: user.id, // Sold By
        refCia: data.refCia || null,
        notas: data.notas || null,
        instruccionesEspeciales: data.instruccionesEspeciales || null,
        subtotal: centsToDecimalString(subtotalCents),
        total: centsToDecimalString(totalCents),
        prescriptions: {
          create: data.prescriptions.filter(hasRx).map((p) => ({
            ojo: p.ojo,
            sphere: p.sphere || null,
            cylinder: p.cylinder || null,
            axis: p.axis || null,
            prism: p.prism || null,
            base: p.base || null,
            far: p.far || null,
            near: p.near || null,
            add: p.add || null,
            segHeight: p.segHeight || null,
          })),
        },
        lensConfig: data.lensConfig
          ? {
              create: {
                tipo: data.lensConfig.tipo,
                subtipo: data.lensConfig.subtipo || null,
                material: data.lensConfig.material ?? null,
                estiloProgresivo: data.lensConfig.estiloProgresivo || null,
                lensColor: data.lensConfig.lensColor || null,
                colorStyle: data.lensConfig.colorStyle ?? null,
                tratamientos: data.lensConfig.tratamientos,
              },
            }
          : undefined,
        frame: data.frame
          ? {
              create: {
                eyeSize: data.frame.eyeSize || null,
                bridge: data.frame.bridge || null,
                temple: data.frame.temple || null,
                vertical: data.frame.vertical || null,
                ed: data.frame.ed || null,
                company: data.frame.company || null,
                color: data.frame.color || null,
                style: data.frame.style || null,
                tipo: data.frame.tipo ?? null,
                ownFrame: data.frame.ownFrame,
                toCome: data.frame.toCome,
                lensesOnly: data.frame.lensesOnly,
              },
            }
          : undefined,
        contactLenses: {
          create: data.contactLenses.filter(hasCl).map((c) => ({
            ojo: c.ojo,
            bc: c.bc || null,
            dia: c.dia || null,
            power: c.power || null,
            color: c.color || null,
            marca: c.marca || null,
          })),
        },
        charges: {
          create: data.charges.map((c) => ({
            concepto: c.concepto,
            descripcion: c.descripcion || null,
            monto: Number(c.monto).toFixed(2),
          })),
        },
      },
    });

    if (depositoCents > 0 && data.depositoMetodo) {
      await tx.payment.create({
        data: {
          orderId: created.id,
          monto: centsToDecimalString(depositoCents),
          metodo: data.depositoMetodo,
          userId: user.id,
          nota: "Initial deposit",
        },
      });
    }

    await tx.auditLog.create({
      data: { userId: user.id, accion: "CREAR", entidad: "Order", entidadId: created.id },
    });

    return created;
  });

  revalidatePath("/ordenes");
  return { ok: true, id: order.id };
}

export async function updateOrderStatus(orderId: string, estado: string): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = orderStatusSchema.safeParse(estado);
  if (!parsed.success) return { ok: false, error: "Invalid status" };

  // Cancelar una orden es correctivo: solo ADMIN
  if (parsed.data === "CANCELADA" && user.role !== "ADMIN") {
    return { ok: false, error: "Only an administrator can cancel orders" };
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { estado: parsed.data } }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        accion: `ESTADO:${parsed.data}`,
        entidad: "Order",
        entidadId: orderId,
      },
    }),
  ]);

  revalidatePath("/ordenes");
  revalidatePath(`/ordenes/${orderId}`);
  return { ok: true, id: orderId };
}

export async function deleteOrder(orderId: string): Promise<ActionResult> {
  const admin = await requireAdmin(); // STAFF no puede borrar órdenes
  const payments = await prisma.payment.count({ where: { orderId } });
  if (payments > 0) {
    return { ok: false, error: "An order with recorded payments cannot be deleted. Cancel it instead." };
  }
  await prisma.$transaction([
    prisma.order.delete({ where: { id: orderId } }),
    prisma.auditLog.create({
      data: { userId: admin.id, accion: "BORRAR", entidad: "Order", entidadId: orderId },
    }),
  ]);
  revalidatePath("/ordenes");
  return { ok: true };
}
