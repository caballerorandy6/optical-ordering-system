import { describe, expect, it } from "vitest";
import {
  toCents,
  centsToDecimalString,
  formatUSD,
  calcSubtotalCents,
  calcBalanceDueCents,
} from "@/lib/money";

describe("toCents", () => {
  it("convierte strings de dólares a centavos", () => {
    expect(toCents("125.50")).toBe(12550);
    expect(toCents("0")).toBe(0);
    expect(toCents("0.01")).toBe(1);
    expect(toCents(" 99.99 ")).toBe(9999);
  });

  it("evita errores de coma flotante", () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents("19.99")).toBe(1999);
  });

  it("lanza con montos inválidos", () => {
    expect(() => toCents("abc")).toThrow();
    expect(() => toCents("")).toThrow();
  });
});

describe("centsToDecimalString", () => {
  it("convierte centavos a string decimal de dos dígitos", () => {
    expect(centsToDecimalString(12550)).toBe("125.50");
    expect(centsToDecimalString(0)).toBe("0.00");
    expect(centsToDecimalString(5)).toBe("0.05");
  });
});

describe("formatUSD", () => {
  it("formatea como dólares", () => {
    expect(formatUSD(12550)).toBe("$125.50");
    expect(formatUSD(0)).toBe("$0.00");
  });
});

describe("calcSubtotalCents", () => {
  it("suma líneas de cargo", () => {
    expect(calcSubtotalCents(["45.00", "180.00", "35.50"])).toBe(26050);
    expect(calcSubtotalCents([])).toBe(0);
  });
});

describe("calcBalanceDueCents (regla de oro contable)", () => {
  it("balanceDue = total − SUM(payments)", () => {
    expect(calcBalanceDueCents(26050, ["100.00"])).toBe(16050);
    expect(calcBalanceDueCents(26050, ["100.00", "160.50"])).toBe(0);
    expect(calcBalanceDueCents(26050, [])).toBe(26050);
  });

  it("pagos parciales acumulados con precisión de centavos", () => {
    expect(calcBalanceDueCents(9999, ["33.33", "33.33", "33.33"])).toBe(0);
  });
});
