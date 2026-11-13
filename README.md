# Spare Parts - Laboratory and Science Supplies

Responsive e-commerce storefront and admin dashboard built for the CubeTech Web Development Internship Assessment.

## Technology Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (responsive desktop and mobile layouts)
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL) with automatic fallback to `.data/demo-db.json` for local runs without external credentials
- **Email:** Resend SDK for order confirmation receipts
- **Currency Handling:** Philippine Peso (`PHP`), stored and calculated as integer centavos to avoid floating-point rounding issues

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/ct-rrya/spareparts_assess.git
cd webassess_cubetech
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

If you want to run with local JSON storage (`.data/demo-db.json`), no Supabase or Resend keys are required. To connect Supabase and Resend, fill in `.env.local`:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DIRECT_URL=postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Spare Parts <onboarding@resend.dev>

DEMO_ADMIN_EMAIL=admin@spareparts.ph
DEMO_ADMIN_PASSWORD=cubetech-demo
```

### 4. Seed Supabase (optional)

If using Supabase PostgreSQL, apply the schema and seed data via the Supabase SQL Editor (`supabase/schema.sql` followed by `supabase/seed.sql`), or run:

```bash
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the admin dashboard (or press `Ctrl+Shift+A` / `Cmd+Shift+A` from any storefront page).

### 6. Production build check

```bash
npm run build
npm run start
```

## Demo Admin Credentials

- **Email:** `admin@spareparts.ph`
- **Password:** `cubetech-demo`

> Note: Demo credentials are for assessment evaluation only and are not intended for production use.

## Key Routes

### Storefront
- `/` - Home page with featured categories and products
- `/products` - Catalog listing with search, category filters, and price sorting
- `/products/[id]` - Product details, stock status, quantity selector, and related items
- `/cart` - Persistent shopping cart (`localStorage`)
- `/checkout` - Guest checkout with server-side stock and total validation
- `/order-confirmation/[orderNumber]` - Order summary and receipt view

### Admin Dashboard
- `/admin/login` - Demo administrator sign-in
- `/admin` - Overview metrics, 7-day sales chart, recent orders, and low stock alerts
- `/admin/products` - Product CRUD, image upload, and stock management
- `/admin/categories` - Category management
- `/admin/orders` and `/admin/orders/[id]` - Order list, status progression, and stock restoration on cancellation
- `/admin/customers` - Read-only customer summary derived from submitted orders
