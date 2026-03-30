# Khata Stock — Inventory & Ledger

Full-stack inventory and **Khata-style** (Indian/Nepali shop) accounting on **Next.js**, **PostgreSQL**, and **Prisma**. Features customers/suppliers ledgers, cashbook, stock with movements, sales/purchase invoices, reports, reminders, and PDF exports.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS v4, Radix-based UI components
- **Backend:** Next.js Route Handlers + Server Actions
- **Database:** PostgreSQL + Prisma ORM v7 with the [`@prisma/adapter-pg`](https://www.prisma.io/docs/orm/overview/databases/postgresql) driver adapter (`pg`)
- **Auth:** Auth.js (NextAuth v5) credentials provider
- **Validation:** Zod + React Hook Form (where forms use client validation)
- **PDF:** jsPDF

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local or Docker)

## Step-by-step setup

1. **Clone / open the project** and install dependencies:

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` — your PostgreSQL URL (must match `prisma.config.ts`).
   - `AUTH_SECRET` — a long random string (e.g. `openssl rand -base64 32`).

3. **Create the database** (example for `psql`):

   ```sql
   CREATE DATABASE inventory_manager;
   ```

4. **Apply schema**

   ```bash
   npm run db:push
   ```

   Or use migrations in production:

   ```bash
   npm run db:migrate
   ```

5. **Generate Prisma Client** (also runs on `npm install` if `postinstall` is enabled):

   ```bash
   npm run db:generate
   ```

6. **Seed demo data**

   ```bash
   npm run db:seed
   ```

   Demo login:

   - Email: `demo@demo.com`
   - Password: `demo123456`

7. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). You will be redirected to sign-in.

## Folder structure (high level)

```
prisma/
  schema.prisma      # Data model
  seed.ts            # Demo seed
src/
  app/               # Routes (App Router)
    (main)/          # Authenticated shell (header + bottom actions)
    api/auth/        # Auth.js route
    login/           # Public auth
    register/
  actions/           # Server Actions (ledger, sales, products, …)
  components/        # UI + feature components
  lib/               # prisma, auth, format, pdf helpers
  server/            # Server-only data helpers (e.g. dashboard)
  generated/prisma/  # Prisma Client (generated)
```

## Main routes

| Path | Description |
|------|-------------|
| `/dashboard` | Summary cards, receivable/payable, cash, low stock |
| `/customers`, `/customers/[id]` | Customer khata + PDF |
| `/suppliers`, `/suppliers/[id]` | Supplier ledger |
| `/cashbook` | Cash in/out with chart |
| `/inventory`, `/inventory/new`, `/inventory/products/[id]` | Products & stock |
| `/sales`, `/sales/new` | Sales invoices |
| `/purchases`, `/purchases/new` | Purchase bills |
| `/reports` | P/L style summary + tables + PDF |
| `/reminders` | Due tasks |
| `/settings` | Business profile |

## Production notes

- Use a managed PostgreSQL and strong `AUTH_SECRET`.
- Add HTTPS and secure cookies in production.
- File uploads: extend `Attachment` with API routes storing under `public/uploads` or S3-compatible storage.
- For Clerk instead of Auth.js, swap the auth layer in `src/auth.ts` and middleware.

## License

Use and modify for your business or learning.
