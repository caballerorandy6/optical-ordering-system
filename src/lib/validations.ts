import { z } from "zod";

// ─── Validaciones de rangos ópticos ───
// Sphere/Cylinder: -20.00 a +20.00 en pasos de 0.25. Axis: 0–180 entero.

const opticalPower = (label: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace("+", ""))
    .refine(
      (v) => {
        if (v === "") return true;
        const n = Number(v);
        return Number.isFinite(n) && n >= -20 && n <= 20 && Math.round(n * 100) % 25 === 0;
      },
      { message: `${label}: between -20.00 and +20.00 in 0.25 steps` }
    )
    .optional()
    .or(z.literal(""));

const axisValue = z
  .string()
  .trim()
  .refine(
    (v) => {
      if (v === "") return true;
      const n = Number(v);
      return Number.isInteger(n) && n >= 0 && n <= 180;
    },
    { message: "Axis: integer between 0 and 180" }
  )
  .optional()
  .or(z.literal(""));

const shortText = z.string().trim().max(30).optional().or(z.literal(""));

// Monto en dólares como string de input ("125.50")
const montoString = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, {
    message: "Invalid amount",
  })
  .refine((v) => Number(v) <= 99999.99, { message: "Amount too large" });

// ─── Cliente ───

export const customerSchema = z.object({
  nombre: z.string().trim().min(1, "Name is required").max(60),
  apellido: z.string().trim().min(1, "Last name is required").max(60),
  telefono: z.string().trim().max(20).optional().or(z.literal("")),
  celular: z.string().trim().max(20).optional().or(z.literal("")),
  direccion: z.string().trim().max(200).optional().or(z.literal("")),
  fechaNacimiento: z.string().trim().optional().or(z.literal("")),
  notas: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;

// ─── Orden ───

export const prescriptionSchema = z.object({
  ojo: z.enum(["OD", "OS"]),
  sphere: opticalPower("Sphere"),
  cylinder: opticalPower("Cylinder"),
  axis: axisValue,
  prism: shortText,
  base: shortText,
  far: shortText,
  near: shortText,
  add: shortText,
  segHeight: shortText,
});

export const lensConfigSchema = z.object({
  tipo: z.enum(["SV", "BIFOCAL", "TRIFOCAL", "PROGRESSIVE"]),
  subtipo: z.string().trim().max(40).optional().or(z.literal("")),
  material: z.enum(["PLASTIC", "GLASS", "POLY", "HI_INDEX", "TRANSIT"]).optional(),
  estiloProgresivo: z.string().trim().max(60).optional().or(z.literal("")),
  lensColor: z.string().trim().max(40).optional().or(z.literal("")),
  colorStyle: z.enum(["GRADIENT", "SOLID"]).optional(),
  tratamientos: z.array(
    z.enum(["AR_COAT", "POLY_BLUE_AR", "TINT", "EDGE_DRILL", "POLY_H_INDEX", "TRANSITIONS"])
  ),
});

export const frameSchema = z.object({
  eyeSize: shortText,
  bridge: shortText,
  temple: shortText,
  vertical: shortText,
  ed: shortText,
  company: z.string().trim().max(60).optional().or(z.literal("")),
  color: z.string().trim().max(40).optional().or(z.literal("")),
  style: z.string().trim().max(60).optional().or(z.literal("")),
  tipo: z.enum(["METAL", "ZYL", "RIMLESS"]).optional(),
  ownFrame: z.boolean(),
  toCome: z.boolean(),
  lensesOnly: z.boolean(),
});

export const contactLensSchema = z.object({
  ojo: z.enum(["OD", "OS"]),
  bc: shortText,
  dia: shortText,
  power: shortText,
  color: z.string().trim().max(40).optional().or(z.literal("")),
  marca: z.string().trim().max(60).optional().or(z.literal("")),
});

export const chargeLineSchema = z.object({
  concepto: z.enum([
    "EXAM",
    "LENSES",
    "FRAME",
    "CONTACT_LENSES",
    "AR",
    "TINT",
    "EDGE_DRILL",
    "TRANSITIONS",
    "OTRO",
  ]),
  descripcion: z.string().trim().max(120).optional().or(z.literal("")),
  monto: montoString,
});

export const paymentMethodEnum = z.enum(["CASH", "VISA", "MC", "AMEX", "DISCOVER", "DEBIT"]);

export const orderSchema = z
  .object({
    customerId: z.string().min(1, "Select a customer"),
    refCia: z.string().trim().max(60).optional().or(z.literal("")),
    notas: z.string().trim().max(1000).optional().or(z.literal("")),
    instruccionesEspeciales: z.string().trim().max(1000).optional().or(z.literal("")),
    prescriptions: z.array(prescriptionSchema).max(2),
    lensConfig: lensConfigSchema.optional(),
    frame: frameSchema.optional(),
    contactLenses: z.array(contactLensSchema).max(2),
    charges: z.array(chargeLineSchema).min(1, "Agrega al menos un cargo"),
    deposito: z
      .string()
      .trim()
      .refine((v) => v === "" || (Number.isFinite(Number(v)) && Number(v) >= 0), {
        message: "Invalid deposit",
      })
      .optional()
      .or(z.literal("")),
    depositoMetodo: paymentMethodEnum.optional(),
  })
  .refine(
    (data) => {
      const dep = Number(data.deposito || 0);
      return dep === 0 || data.depositoMetodo !== undefined;
    },
    { message: "Select the deposit payment method", path: ["depositoMetodo"] }
  )
  .refine(
    (data) => {
      const dep = Number(data.deposito || 0);
      const total = data.charges.reduce((acc, c) => acc + Number(c.monto), 0);
      return dep <= total;
    },
    { message: "The deposit cannot be greater than the total", path: ["deposito"] }
  );

export type OrderInput = z.infer<typeof orderSchema>;

// ─── Pago (abono) ───

export const paymentSchema = z.object({
  orderId: z.string().min(1),
  monto: montoString.refine((v) => Number(v) > 0, { message: "The payment must be greater than 0" }),
  metodo: paymentMethodEnum,
  nota: z.string().trim().max(200).optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

// ─── Estado de orden ───

export const orderStatusSchema = z.enum(["ABIERTA", "LISTA", "ENTREGADA", "CANCELADA"]);

// ─── Usuarios (Config, solo ADMIN) ───

export const newUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["ADMIN", "STAFF"]),
});

export type NewUserInput = z.infer<typeof newUserSchema>;
