import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  appName: "Sistema de Órdenes para Óptica",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Las cuentas las crea solo el ADMIN desde Configuración; no hay registro público
    disableSignUp: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  plugins: [
    admin({ defaultRole: "STAFF", adminRoles: ["ADMIN"] }),
    nextCookies(), // debe ir al final: setea cookies desde Server Actions
  ],
});

export type Session = typeof auth.$Infer.Session;
