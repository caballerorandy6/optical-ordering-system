@AGENTS.md

# Sistema de Órdenes para Óptica

## Contexto
App web en español para una óptica pequeña en Houston. Digitaliza el
formulario de órdenes en papel: Rx, lentes, monturas, lentes de contacto,
cargos, pagos parciales y balance pendiente.

## Stack
Next.js 16 App Router + TypeScript estricto, Tailwind 4 + shadcn/ui,
Prisma 7 + PostgreSQL (adapter @prisma/adapter-pg), Better Auth con roles
ADMIN/STAFF (plugin admin), Zod 4 compartido, @react-pdf/renderer, Vitest.

## Reglas
- Toda la UI en español. Código y nombres de variables en inglés (campos del dominio en español donde replican la hoja física).
- Server Actions para mutaciones; validar SIEMPRE con Zod en el servidor (`safeParse`).
- balanceDue nunca se guarda: se calcula como total - sum(payments) (`calcBalanceDueCents` en src/lib/money.ts).
- Aritmética de dinero SIEMPRE en centavos enteros (src/lib/money.ts), nunca floats.
- Los pagos son inmutables para STAFF; solo ADMIN puede corregir (deletePayment) y queda en AuditLog.
- Datos de salud (Rx): nunca loggear PII, queries con select explícito, sin PII en URLs.
- Roles verificados en el servidor en CADA mutación (requireUser/requireAdmin en src/lib/session.ts), no solo en UI.
- El folio es secuencial vía autoincrement de Postgres (seguro con concurrencia). Nunca calcular MAX(folio)+1.
- Mobile-first: el staff usará tablet (sidebar → barra inferior en móvil).
- Tests: Vitest para lógica de cálculos (totales, balance) y validaciones como mínimo.
- Antes de crear componentes nuevos, revisar los existentes en src/components.
- Next 16: params/searchParams/cookies/headers son async (await); proxy.ts en lugar de middleware.ts; build de producción con webpack (Turbopack tiene incompatibilidad conocida con Prisma).
- Datos del negocio (nombre, dirección) solo en src/lib/constants.ts / env — cero datos del cliente hardcodeados (producto repetible para otras ópticas).

## Comandos
- npm run dev / build / lint / typecheck / test
- npx prisma migrate dev / studio / db seed

## Usuarios demo (seed)
- admin@optica.local / Admin123! (ADMIN)
- maria@optica.local / Staff123! (STAFF)
- jose@optica.local / Staff123! (STAFF)
