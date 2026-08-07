// Catálogos y etiquetas en español. Los valores (keys) replican la hoja física.

export const ORDER_STATUS = {
  ABIERTA: "Abierta",
  LISTA: "Lista",
  ENTREGADA: "Entregada",
  CANCELADA: "Cancelada",
} as const;

export const EYES = {
  OD: "OD (R)",
  OS: "OS (L)",
} as const;

export const LENS_TYPES = {
  SV: "S.V. (visión sencilla)",
  BIFOCAL: "Bifocal",
  TRIFOCAL: "Trifocal",
  PROGRESSIVE: "Progresivo",
} as const;

// Subtipos tal como aparecen en la hoja
export const LENS_SUBTYPES: Record<string, string[]> = {
  SV: [],
  BIFOCAL: ["Flat top", "Kryptok", "Executive", "25", "28", "35", "40"],
  TRIFOCAL: ["Executive", "7/25", "7/28", "8/35", "Otro"],
  PROGRESSIVE: [],
};

export const LENS_MATERIALS = {
  PLASTIC: "Plástico",
  GLASS: "Cristal",
  POLY: "Policarbonato",
  HI_INDEX: "Alto índice",
  TRANSIT: "Transitions",
} as const;

export const LENS_TREATMENTS = {
  AR_COAT: "AR Coat (antirreflejante)",
  POLY_BLUE_AR: "Poly Blue AR",
  TINT: "Tinte",
  EDGE_DRILL: "Edge / Drill",
  POLY_H_INDEX: "Poly H Index",
  TRANSITIONS: "Transitions",
} as const;

export const LENS_COLOR_STYLES = {
  GRADIENT: "Gradiente",
  SOLID: "Sólido",
} as const;

export const FRAME_TYPES = {
  METAL: "Metal",
  ZYL: "Zyl (acetato)",
  RIMLESS: "Rimless (al aire)",
} as const;

export const CHARGE_CONCEPTS = {
  EXAM: "Examen",
  LENSES: "Lentes",
  FRAME: "Montura",
  CONTACT_LENSES: "Lentes de contacto",
  AR: "A/R",
  TINT: "Tinte",
  EDGE_DRILL: "Edge/Drill",
  TRANSITIONS: "Transitions",
  OTRO: "Otro",
} as const;

export const PAYMENT_METHODS = {
  CASH: "Efectivo",
  VISA: "Visa",
  MC: "MasterCard",
  AMEX: "Amex",
  DISCOVER: "Discover",
  DEBIT: "Débito",
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS;
export type PaymentMethodKey = keyof typeof PAYMENT_METHODS;
export type ChargeConceptKey = keyof typeof CHARGE_CONCEPTS;
