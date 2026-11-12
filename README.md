# Optical Ordering System

**Order management for optical shops** — prescriptions (Rx), lenses, frames, contact lenses, partial payments and balance tracking. It replaces the paper order form so staff can register a complete order in under 3 minutes from a tablet.

**Live demo:** [optical-ordering-system.vercel.app](https://optical-ordering-system.vercel.app) (read-only; demo accounts are shown on the sign-in page)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38b2ac?logo=tailwindcss)

## What it does

- **Customers:** create, edit and search customers, with their order history.
- **Orders:** one form for the prescription (both eyes), lens configuration, frame, contact lenses and charge lines. Each order gets a sequential folio.
- **Payments:** partial payments by method (cash, Visa, Mastercard, Amex, Discover, debit). The balance due is always calculated from the payments, never stored.
- **Order status:** Open → Ready → Delivered; only an admin can cancel.
- **Printable order:** PDF that replicates the shop's paper form (`@react-pdf/renderer`).
- **Reports:** cash closing by payment method, collected per day, sales per seller and collected per user, with CSV export for Excel.
- **Users and roles:** ADMIN and STAFF, enforced on the server for every change, with an audit log for payment corrections.
- **Bilingual UI:** English and Spanish (`next-intl`).

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react, Sonner |
| Data | PostgreSQL, Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Better Auth (credentials, database sessions, roles, login rate limiting) |
| Forms and validation | React Hook Form, Zod 4 (shared by client and server) |
| PDF | `@react-pdf/renderer` |
| Testing | Vitest (money, validation and demo-mode logic) |
| Hosting | Vercel |

## Design decisions

- `balanceDue` is **never stored**: it is always `total − SUM(payments)`.
- Money is handled as integer cents only (`src/lib/money.ts`).
- Payments are immutable for STAFF; only ADMIN can correct them, and every correction is logged.
- Roles are checked on the server for every mutation (`src/lib/session.ts`).
- The order folio is a PostgreSQL autoincrement, so it is safe with concurrent users.
- The shop's name, address and phone come from environment variables; no client data is hardcoded.

## Getting started

**Requirements:** Node.js 20.9+ and PostgreSQL.

```bash
git clone https://github.com/caballerorandy6/optical-ordering-system.git
cd optical-ordering-system
npm install                 # also runs prisma generate
cp .env.example .env        # set the variables below
npx prisma migrate dev      # create the database tables
npx prisma db seed          # demo users and customers
npm run dev                 # http://localhost:3000
```

Demo accounts after seeding: `admin@optica.local / Admin123!` (admin) and `maria@optica.local / Staff123!` (staff).

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Better Auth secret |
| `BETTER_AUTH_URL` | App URL, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_BUSINESS_NAME`, `NEXT_PUBLIC_BUSINESS_ADDRESS`, `NEXT_PUBLIC_BUSINESS_PHONE` | Shop details printed on orders |
| `DEMO_READ_ONLY` | `1` makes the app read-only; `0` for a real deployment |

### Read-only demo

On Vercel the app is read-only by default because the sign-in page shows shared demo accounts: Server Actions that write return an error, and Better Auth only answers sign-in, sign-out and get-session. For a real deployment, remove the demo accounts from the sign-in page and the database, and set `DEMO_READ_ONLY=0`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (webpack; Turbopack has a known Prisma issue) |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

A user manual in Spanish for the shop staff is in [`MANUAL.md`](MANUAL.md).

## Author

**Randy Caballero** — Full-Stack Developer, Houston, TX
[rcweb.dev](https://rcweb.dev) · [LinkedIn](https://linkedin.com/in/caballerorandy) · [GitHub](https://github.com/caballerorandy6)
