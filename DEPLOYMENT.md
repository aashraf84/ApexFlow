# ApexFlow — Vercel Deployment Guide

This project is **build-verified and deploy-ready**. Follow these steps to deploy to your Vercel account with a Neon Postgres database.

## What was done (summary of fixes)

- Reconstructed the complete Prisma schema (was 10 models → now **37 models**: admin auth, ERP registry, clients/CRM, finance/orders/payments, communications, marketing, sync/integrations, reports, devices, site settings).
- Fixed `db.ticket` → `db.supportTicket` and `db.auditLog` → `db.adminAuditLog` typos in the catch-all + dashboard routes.
- Fixed checkout writing the literal `"unknown"` into the `erpSystemId` foreign key (now `null`).
- Made `ErpSystem` DB-connection fields nullable (`dbHost/dbName/dbUser/dbPassword`) so the ERP registry works before you link real ERP databases.
- Installed missing dependencies (`stripe`, `socket.io-client`) that were imported but not in `package.json`.
- Deleted the dead root-level duplicate `app/`, `components/`, `lib/`, `hooks/` directories (were causing duplicate-route build failures).
- Added `postinstall` + `vercel-build` scripts so `prisma generate` runs automatically on Vercel.
- Seeded the admin user and 21-ERP registry; verified all 21 admin API routes return 200 and every public + admin page renders.

## Pre-deploy checklist (IMPORTANT)

### 1. Prisma provider is set to PostgreSQL ✅ (already done in the repo)

`prisma/schema.prisma` already has `provider = "postgresql"` for Neon/Vercel.
(To run locally on SQLite instead, temporarily switch it to `"sqlite"` and set
`DATABASE_URL="file:./db/apexflow.db"` — the model definitions are identical.)

### 2. Create a Neon database

1. Go to https://neon.tech and create a project (free tier).
2. Copy the connection string (the pooled one, e.g. `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`).

### 3. Push the schema to Neon (run once, locally)

```bash
# set DATABASE_URL to your Neon string for this command
DATABASE_URL="postgresql://user:pass@ep-xxx...neon.tech/dbname?sslmode=require" bunx prisma db push
```

This creates all 37 tables in your Neon DB.

### 4. Push to your GitHub account

```bash
# point the remote at your new repo (replace with your URL)
git remote set-url origin https://github.com/<your-account>/ApexFlow.git
git add -A
git commit -m "feat: complete prisma schema, fix typos, install deps, Vercel-ready"
git push -u origin main
```

### 5. Deploy on Vercel

1. https://vercel.com → New Project → import `ApexFlow` from your GitHub.
2. Framework: **Next.js** (auto-detected).
3. Build & Output Settings: leave default (uses `vercel-build` script = `prisma generate && next build`).
4. Environment Variables → add:

   | Name | Value | Required |
   |------|-------|----------|
   | `DATABASE_URL` | your Neon pooled connection string | ✅ yes |
   | `RESET_SECRET` | `apexflow2024` (or your own) | optional |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | optional |
   | `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | optional (sandbox simulates without it) |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | optional |
   | `STRIPE_PUBLISHABLE_KEY` | `pk_...` | optional |
   | `STRIPE_PRICE_*` | one per plan/cycle | optional |

5. Deploy. The build runs `prisma generate && next build` (~1–2 min).

### 6. Seed the production database (one time)

After the first successful deploy, hit the seed endpoints once (Vercel CLI makes this easy):

```bash
# pull the Vercel env locally so DATABASE_URL points at Neon
vercel env pull .env.production.local
# seed admin + roles
curl -X POST https://your-app.vercel.app/api/auth/seed -H "Content-Type: application/json" -d '{}'
# seed the 21-ERP registry
curl -X POST https://your-app.vercel.app/api/seed-erps -H "Content-Type: application/json" -d '{}'
```

Then log in at `https://your-app.vercel.app/admin/login`:

- **Email:** `admin@apexflow.com`
- **Password:** `Admin@180H`

⚠️ Change this password immediately after first login (System → Users → change password).

## ERP integrations (later)

The 21 ERP registry entries are seeded but **not yet linked to real databases**. To connect an ERP later:

1. Admin → **ERP Systems** → edit an ERP → set `dbHost/dbName/dbUser/dbPassword` (or set the per-ERP `<SLUG>_DATABASE_URL` env var, e.g. `ELECTROFLOW_DATABASE_URL`).
2. Admin → **Integrations** → add a connector + test connection.

The ElectroFlow demo app (`/electroflow`) and its `/api/electroflow/*` routes require the ElectroFlow business models (Tenant, Customer, Product, Sale, …) which are intentionally **not** in the committed schema yet — add them when you wire ElectroFlow. FleetFlow (`/fleetflow`) is fully mock and works without a DB.

## Local development

```bash
bun install
# .env should contain:
#   DATABASE_URL="file:./db/apexflow.db"
#   USE_LOCAL_SQLITE=true
bunx prisma db push      # create SQLite tables
curl -X POST http://localhost:3000/api/auth/seed -d '{}'   # after `bun run dev`
curl -X POST http://localhost:3000/api/seed-erps -d '{}'
bun run dev
```

> Note: when `provider = "postgresql"` (for Vercel), local dev needs a Neon `DATABASE_URL` instead of SQLite. Keep a separate git branch or flip the provider line per environment as needed.
