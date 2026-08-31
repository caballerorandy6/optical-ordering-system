// Datos del negocio configurables (cero datos del cliente hardcodeados en componentes).
// Al vender el sistema a otra óptica, solo se cambia este archivo / variables de entorno.

export const BUSINESS = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "Optical Shop",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "Houston, TX",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "",
} as const;
