// Catalogs with English labels (fallback for PDF/CSV; the UI uses localized
// messages from messages/*.json). Keys replicate the physical order sheet and
// are the values stored in the database — never change them.

export const ORDER_STATUS = {
  ABIERTA: "Open",
  LISTA: "Ready",
  ENTREGADA: "Delivered",
  CANCELADA: "Cancelled",
} as const;

export const EYES = {
  OD: "OD (R)",
  OS: "OS (L)",
} as const;

export const LENS_TYPES = {
  SV: "S.V. (single vision)",
  BIFOCAL: "Bifocal",
  TRIFOCAL: "Trifocal",
  PROGRESSIVE: "Progressive",
} as const;

// Subtipos tal como aparecen en la hoja
export const LENS_SUBTYPES: Record<string, string[]> = {
  SV: [],
  BIFOCAL: ["Flat top", "Kryptok", "Executive", "25", "28", "35", "40"],
  TRIFOCAL: ["Executive", "7/25", "7/28", "8/35", "Otro"],
  PROGRESSIVE: [],
};

export const LENS_MATERIALS = {
  PLASTIC: "Plastic",
  GLASS: "Glass",
  POLY: "Polycarbonate",
  HI_INDEX: "Hi-index",
  TRANSIT: "Transitions",
} as const;

export const LENS_TREATMENTS = {
  AR_COAT: "AR Coat (anti-reflective)",
  POLY_BLUE_AR: "Poly Blue AR",
  TINT: "Tint",
  EDGE_DRILL: "Edge / Drill",
  POLY_H_INDEX: "Poly H Index",
  TRANSITIONS: "Transitions",
} as const;

export const LENS_COLOR_STYLES = {
  GRADIENT: "Gradient",
  SOLID: "Solid",
} as const;

export const FRAME_TYPES = {
  METAL: "Metal",
  ZYL: "Zyl (acetate)",
  RIMLESS: "Rimless",
} as const;

export const CHARGE_CONCEPTS = {
  EXAM: "Exam",
  LENSES: "Lenses",
  FRAME: "Frame",
  CONTACT_LENSES: "Contact lenses",
  AR: "A/R",
  TINT: "Tint",
  EDGE_DRILL: "Edge/Drill",
  TRANSITIONS: "Transitions",
  OTRO: "Other",
} as const;

export const PAYMENT_METHODS = {
  CASH: "Cash",
  VISA: "Visa",
  MC: "MasterCard",
  AMEX: "Amex",
  DISCOVER: "Discover",
  DEBIT: "Debit",
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS;
export type PaymentMethodKey = keyof typeof PAYMENT_METHODS;
export type ChargeConceptKey = keyof typeof CHARGE_CONCEPTS;
