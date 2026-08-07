import "server-only";

import { prisma } from "@/lib/prisma";
import { calcBalanceDueCents, toCents } from "@/lib/money";
import type { Prisma } from "@/generated/prisma/client";

// ─── Clientes ───

export async function searchCustomers(query: string) {
  const q = query.trim();
  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { apellido: { contains: q, mode: "insensitive" } },
          { telefono: { contains: q } },
          { celular: { contains: q } },
        ],
      }
    : {};
  return prisma.customer.findMany({
    where,
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    take: 50,
  });
}

export async function getCustomerWithOrders(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { fecha: "desc" },
        include: { payments: { select: { monto: true } } },
      },
    },
  });
  if (!customer) return null;

  const orders = customer.orders.map((o) => ({
    id: o.id,
    folio: o.folio,
    fecha: o.fecha,
    estado: o.estado,
    totalCents: toCents(o.total.toString()),
    balanceCents:
      o.estado === "CANCELADA"
        ? 0
        : calcBalanceDueCents(
            toCents(o.total.toString()),
            o.payments.map((p) => p.monto.toString())
          ),
  }));

  return {
    ...customer,
    orders,
    balanceTotalCents: orders.reduce((acc, o) => acc + o.balanceCents, 0),
  };
}

// ─── Órdenes ───

export type OrderListFilter = {
  estado?: "ABIERTA" | "LISTA" | "ENTREGADA" | "CANCELADA";
  conBalance?: boolean;
  q?: string;
};

export async function listOrders(filter: OrderListFilter = {}) {
  const where: Prisma.OrderWhereInput = {};
  if (filter.estado) where.estado = filter.estado;
  if (filter.q) {
    where.OR = [
      { customer: { nombre: { contains: filter.q, mode: "insensitive" } } },
      { customer: { apellido: { contains: filter.q, mode: "insensitive" } } },
      ...(Number.isInteger(Number(filter.q)) && filter.q !== ""
        ? [{ folio: Number(filter.q) }]
        : []),
    ];
  }
  const orders = await prisma.order.findMany({
    where,
    orderBy: { fecha: "desc" },
    take: 200,
    include: {
      customer: { select: { nombre: true, apellido: true } },
      user: { select: { name: true } },
      payments: { select: { monto: true } },
    },
  });

  const mapped = orders.map((o) => ({
    id: o.id,
    folio: o.folio,
    fecha: o.fecha,
    estado: o.estado,
    cliente: `${o.customer.apellido}, ${o.customer.nombre}`,
    vendedor: o.user.name,
    totalCents: toCents(o.total.toString()),
    balanceCents:
      o.estado === "CANCELADA"
        ? 0
        : calcBalanceDueCents(
            toCents(o.total.toString()),
            o.payments.map((p) => p.monto.toString())
          ),
  }));

  return filter.conBalance ? mapped.filter((o) => o.balanceCents > 0) : mapped;
}

export async function getOrderDetail(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      user: { select: { name: true } },
      prescriptions: true,
      lensConfig: true,
      frame: true,
      contactLenses: true,
      charges: true,
      payments: {
        orderBy: { fecha: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!order) return null;

  const totalCents = toCents(order.total.toString());
  const balanceCents =
    order.estado === "CANCELADA"
      ? 0
      : calcBalanceDueCents(
          totalCents,
          order.payments.map((p) => p.monto.toString())
        );

  return { order, totalCents, subtotalCents: toCents(order.subtotal.toString()), balanceCents };
}
