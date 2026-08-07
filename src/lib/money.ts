// Aritmética de dinero SIEMPRE en centavos (enteros) para evitar errores de coma flotante.

/** "125.50" | 125.5 → 12550. Lanza si no es un monto válido. */
export function toCents(value: string | number): number {
  if (typeof value === "string" && value.trim() === "") {
    throw new Error("Monto inválido: cadena vacía");
  }
  const n = typeof value === "string" ? Number(value.trim()) : value;
  if (!Number.isFinite(n)) throw new Error(`Monto inválido: ${value}`);
  return Math.round(n * 100);
}

/** 12550 → "125.50" (para inputs y persistencia Decimal). */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** 12550 → "$125.50" */
export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Suma de líneas de cargo, en centavos. */
export function calcSubtotalCents(lineAmounts: Array<string | number>): number {
  return lineAmounts.reduce<number>((acc, m) => acc + toCents(m), 0);
}

/** Regla de oro contable: balanceDue = total − SUM(payments). Nunca se guarda. */
export function calcBalanceDueCents(
  totalCents: number,
  paymentAmounts: Array<string | number>
): number {
  const paid = paymentAmounts.reduce<number>((acc, m) => acc + toCents(m), 0);
  return totalCents - paid;
}
