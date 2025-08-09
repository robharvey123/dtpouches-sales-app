# DT Pouches Sales App

Web app to upload sales spreadsheets, map/validate columns, store to Supabase (Postgres), and visualise performance by customer/brand.

## Stack
- **Frontend**: Next.js 14 (App Router, Server Actions)
- **Auth/DB**: Supabase (Postgres + Auth + RLS)
- **Hosting**: Netlify (connect this repo and enable the Next.js plugin)
- **Source**: GitHub (push this folder to a new repo)

## Quick Start (Local)
```bash
cp .env.example .env.local
npm i
npm run dev
# open http://localhost:3000
```

Create a Supabase project, then in the SQL editor run:
- `scripts/init.sql` (base schema & RLS)
- `scripts/patch.sql` (column mappings & staging tables)

Set the two env vars from Supabase → Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deploy to Netlify
1. Push this folder to **GitHub**.
2. In Netlify, **New site from Git** → choose the repo.
3. Build command: `npm run build` (default). Publish dir: `.next`.
4. Netlify auto-detects Next.js; keep the **Next.js plugin** enabled.
5. Add the two env vars above in Netlify → Site settings → Environment.
6. Redeploy. Visit `/login`, `/upload`, `/dashboard`.

## Structure
- `src/app/(auth)/login/page.tsx` — Magic link auth.
- `src/app/upload/page.tsx` — Mapping wizard + ingest flow.
- `src/app/upload/actions.ts` — Server Actions for save/get mapping and ingest.
- `src/app/dashboard/page.tsx` — KPI placeholder (wire to real data next).
- `src/lib/*` — types & validation helpers.
- `scripts/init.sql` — base schema + RLS.
- `scripts/patch.sql` — mapping & staging tables.

## Notes
- The mapping wizard remembers column → standard field per organisation (and optional per-customer).
- For MVP, `organisation_id` is hardcoded in the upload page. Wire this to the signed-in user's org once you create entries in `app_user`.
- Next steps: dashboard queries, auth→org wiring, Zoho read-only sync (Accounts→Customers, Products→SKUs).
