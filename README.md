# Optical Ordering System

Order management system for optical shops: prescriptions (Rx), lenses, frames, contact lenses, partial payments and balance tracking. Digitizes the paper order form so staff can register a complete order in under 3 minutes from a tablet.

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript
- **Tailwind CSS 4** + shadcn/ui
- **PostgreSQL** + **Prisma 7** (`@prisma/adapter-pg`)
- **Better Auth** — credentials, DB sessions, ADMIN/STAFF roles, login rate limiting
- **Zod 4** — shared client/server validation
- **@react-pdf/renderer** — order PDF replicating the physical form
- **next-intl** — bilingual UI (Spanish primary, English secondary)
- **Vitest** — unit tests for money/balance logic

## Getting started

```bash
npm install
cp .env.example .env   # set DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
npx prisma migrate dev
npx prisma db seed     # demo users + customers
npm run dev
```

Demo accounts: `admin@optica.local / Admin123!` (admin) · `maria@optica.local / Staff123!` (staff).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (webpack — Turbopack has a known Prisma incompatibility) |
| `npm run test` | Vitest unit tests |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Key rules

- `balanceDue` is **never stored** — always computed as `total − SUM(payments)`.
- Money arithmetic is integer cents only (`src/lib/money.ts`).
- Payments are immutable for STAFF; only ADMIN can correct them (audit-logged).
- Roles are enforced server-side on every mutation (`src/lib/session.ts`).
- Order folio is a Postgres autoincrement (concurrency-safe).
- Business identity (name, address) lives in env vars — no client data hardcoded.
