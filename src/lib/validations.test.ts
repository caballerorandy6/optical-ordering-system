import { describe, expect, it } from "vitest";
import { orderSchema, prescriptionSchema, paymentSchema } from "@/lib/validations";

const baseOrder = {
  customerId: "c1",
  refCia: "",
  notas: "",
  instruccionesEspeciales: "",
  prescriptions: [],
  contactLenses: [],
  charges: [{ concepto: "EXAM" as const, descripcion: "", monto: "45.00" }],
  deposito: "",
};

describe("prescriptionSchema (rangos ópticos)", () => {
  it("acepta sphere válido en pasos de 0.25", () => {
    const r = prescriptionSchema.safeParse({ ojo: "OD", sphere: "-2.25" });
    expect(r.success).toBe(true);
  });

  it("acepta sphere con signo +", () => {
    const r = prescriptionSchema.safeParse({ ojo: "OD", sphere: "+1.50" });
    expect(r.success).toBe(true);
  });

  it("rechaza sphere fuera de rango", () => {
    const r = prescriptionSchema.safeParse({ ojo: "OD", sphere: "-25.00" });
    expect(r.success).toBe(false);
  });

  it("rechaza sphere fuera de paso 0.25", () => {
    const r = prescriptionSchema.safeParse({ ojo: "OD", sphere: "-2.30" });
    expect(r.success).toBe(false);
  });

  it("rechaza axis fuera de 0-180", () => {
    expect(prescriptionSchema.safeParse({ ojo: "OS", axis: "181" }).success).toBe(false);
    expect(prescriptionSchema.safeParse({ ojo: "OS", axis: "90" }).success).toBe(true);
  });
});

describe("orderSchema", () => {
  it("requiere al menos un cargo", () => {
    const r = orderSchema.safeParse({ ...baseOrder, charges: [] });
    expect(r.success).toBe(false);
  });

  it("requiere método de pago si hay depósito", () => {
    const r = orderSchema.safeParse({ ...baseOrder, deposito: "20.00" });
    expect(r.success).toBe(false);
  });

  it("acepta depósito con método", () => {
    const r = orderSchema.safeParse({
      ...baseOrder,
      deposito: "20.00",
      depositoMetodo: "CASH" as const,
    });
    expect(r.success).toBe(true);
  });

  it("rechaza depósito mayor que el total", () => {
    const r = orderSchema.safeParse({
      ...baseOrder,
      deposito: "100.00",
      depositoMetodo: "CASH" as const,
    });
    expect(r.success).toBe(false);
  });
});

describe("paymentSchema", () => {
  it("rechaza abonos de 0", () => {
    expect(
      paymentSchema.safeParse({ orderId: "o1", monto: "0", metodo: "CASH", nota: "" }).success
    ).toBe(false);
  });

  it("acepta abono válido", () => {
    expect(
      paymentSchema.safeParse({ orderId: "o1", monto: "50.00", metodo: "VISA", nota: "" })
        .success
    ).toBe(true);
  });
});
