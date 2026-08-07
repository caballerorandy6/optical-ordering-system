import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Instancia solo-seed con registro habilitado (la app lo tiene deshabilitado)
// para que Better Auth haga el hash de contraseñas con su propio algoritmo.
const seedAuth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  plugins: [admin({ defaultRole: "STAFF", adminRoles: ["ADMIN"] })],
});

const USERS = [
  { name: "Administrador", email: "admin@optica.local", password: "Admin123!", role: "ADMIN" },
  { name: "María López", email: "maria@optica.local", password: "Staff123!", role: "STAFF" },
  { name: "José Ramírez", email: "jose@optica.local", password: "Staff123!", role: "STAFF" },
];

const CUSTOMERS = [
  { nombre: "Ana", apellido: "García", telefono: "832-555-0101", celular: "832-555-0201", direccion: "1234 Main St, Houston, TX 77002", fechaNacimiento: new Date("1985-03-12") },
  { nombre: "Carlos", apellido: "Martínez", telefono: "713-555-0102", celular: "713-555-0202", direccion: "5678 Westheimer Rd, Houston, TX 77056", fechaNacimiento: new Date("1978-11-30") },
  { nombre: "Lucía", apellido: "Hernández", telefono: "281-555-0103", celular: null, direccion: "910 Bellaire Blvd, Houston, TX 77036", fechaNacimiento: new Date("1992-07-08") },
  { nombre: "Miguel", apellido: "Torres", telefono: null, celular: "832-555-0204", direccion: "3016 North Fry Rd, Katy, TX 77449", fechaNacimiento: new Date("1969-01-25") },
  { nombre: "Sofía", apellido: "Reyes", telefono: "346-555-0105", celular: "346-555-0205", direccion: "2200 Gessner Rd, Houston, TX 77080", fechaNacimiento: new Date("2001-09-17") },
];

async function main() {
  for (const u of USERS) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (exists) continue;
    await seedAuth.api.signUpEmail({
      body: { name: u.name, email: u.email, password: u.password },
    });
    await prisma.user.update({
      where: { email: u.email },
      data: { role: u.role, emailVerified: true },
    });
    console.log(`Usuario creado: ${u.email} (${u.role})`);
  }

  for (const c of CUSTOMERS) {
    const exists = await prisma.customer.findFirst({
      where: { nombre: c.nombre, apellido: c.apellido },
    });
    if (exists) continue;
    await prisma.customer.create({ data: c });
    console.log(`Cliente creado: ${c.nombre} ${c.apellido}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
