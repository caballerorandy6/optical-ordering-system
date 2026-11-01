"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { demoWriteBlocked } from "@/lib/demo-guard";
import { requireAdmin } from "@/lib/session";
import { newUserSchema, type NewUserInput } from "@/lib/validations";
import type { ActionResult } from "@/actions/customers";

export async function createStaffUser(input: NewUserInput): Promise<ActionResult> {
  const blocked = await demoWriteBlocked();
  if (blocked) return blocked;
  await requireAdmin();
  const parsed = newUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  try {
    await auth.api.createUser({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        // El plugin admin tipa roles como "admin"|"user"; usamos ADMIN/STAFF vía adminRoles
        role: parsed.data.role as unknown as "admin",
      },
      headers: await headers(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo crear el usuario";
    return { ok: false, error: msg };
  }
  revalidatePath("/config");
  return { ok: true };
}

export async function setUserActive(userId: string, active: boolean): Promise<ActionResult> {
  const blocked = await demoWriteBlocked();
  if (blocked) return blocked;
  await requireAdmin();
  try {
    if (active) {
      await auth.api.unbanUser({ body: { userId }, headers: await headers() });
    } else {
      await auth.api.banUser({
        body: { userId, banReason: "Desactivado por administrador" },
        headers: await headers(),
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudo actualizar el usuario";
    return { ok: false, error: msg };
  }
  revalidatePath("/config");
  return { ok: true };
}
