# AZ Labs: azlabs.pro

**Research. Refined.**

Next.js 15 · React 19 · Tailwind · Supabase (Postgres, Auth, Storage) · Vercel

## Run locally
```bash
cp .env.example .env.local   # fill in values
npm ci
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + tests + production build
```
Without Supabase variables the site runs from the local catalogue (`src/lib/products-data.ts`). The public catalogue then shows its empty state (nothing is approved yet), and ordering and admin are disabled.

## Private preview (test the full store yourself)
Shows all eight products with a working cart and a TEST WhatsApp checkout. It saves nothing and changes no product data, and only you can open it. Unpriced products use a test price of £10 / €12. Retatrutide and Tirzepatide are shown but stay restricted.

- **On your computer, no database needed:** put `LOCAL_PREVIEW=true` in `.env.local`, run `npm run dev`, open http://localhost:3000 (it goes straight to the preview)
- **On the live site:** sign in at `/admin/login`, then click **Preview store** (or open `/preview`). Visitors who aren't signed in are sent to the login page.

## Database setup (run once each, in order)
In the Supabase SQL editor:
1. **New project only:** `supabase/schema.sql`
2. `supabase/migrations/20261101000000_stage1_eligibility_security.sql`
3. `supabase/migrations/20261102000000_catalogue_statuses_storage.sql` (four statuses, restricted lock, private `product-images` bucket, the eight catalogue products)

Then upload the catalogue images to storage:
```bash
npm run seed:images          # reads .env.local; uploads seed/images/* to product-images/catalogue/
```
Create an admin user (Supabase → Authentication → Add user), then:
```sql
insert into public.admin_profiles (user_id, email, role)
select id, email, 'super_admin' from auth.users where email = 'you@azlabs.pro';
```
Sign in at `/admin/login`. Roles: `super_admin` and `admin` can edit; `auditor` is read-only.

## Deploy (Vercel)
1. Import the repo. Framework: Next.js (auto-detected).
2. Add the environment variables from `.env.example` (Production and Preview). `SUPABASE_SERVICE_ROLE_KEY` must **not** have the `NEXT_PUBLIC_` prefix.
3. Deploy, then check `/`, `/admin/login` and `/sitemap.xml`.

## Selling a product
See [docs/ELIGIBILITY.md](docs/ELIGIBILITY.md). Products are hidden until approved, orderable only when approved for sale, and Retatrutide and Tirzepatide are locked.

## Key files
| File | Purpose |
|---|---|
| `src/lib/eligibility.ts` | Listing/purchase gate and status rules (UI + API) |
| `src/lib/pricing.ts` | Server-authoritative quotes |
| `src/lib/order-service.ts`, `src/app/api/orders` | Order creation: zod validation, idempotency, rate limit |
| `src/lib/whatsapp.ts` | WhatsApp order summary |
| `src/lib/data.ts` | Supabase queries, signed image URLs, admin mutations + audit log |
| `src/lib/admin-auth.ts` | Supabase Auth + `admin_profiles` check |
| `src/components/admin/admin-dashboard.tsx` | Products (create/edit/images/status), orders, audit log |
| `src/app/products/[slug]` | Product pages (approved products only) |
| `src/lib/site-config.ts` | Contact details, WhatsApp number, company disclosures |
