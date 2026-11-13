# Spare Parts — Laboratory & Science Supplies

Responsive e-commerce storefront and admin dashboard built for the **CubeTech Web Development Internship Assessment**.

---

## 1. Overview & Technologies
- **Framework**: Next.js 15 (App Router, React 19) + TypeScript
- **Styling**: Tailwind CSS v4 (responsive desktop 1280–1440px / mobile 360–375px, clean e-commerce layout)
- **Database**: Supabase (PostgreSQL) with automatic fallback to persistent `.data/demo-db.json` for zero-setup local runs
- **Seeding Tool**: Automated direct script (`npm run db:seed` via `pg`) + raw SQL scripts (`supabase/schema.sql`, `supabase/seed.sql`)
- **Email Delivery**: [Resend](https://resend.com) SDK for automatic order confirmation receipts with HTML & text formats
- **Currency**: Philippine Peso (`PHP`), stored and computed safely as integer centavos to prevent floating-point rounding errors

---

## 2. Storage Approach & Limitations

This application implements the **Backend / Database** approach using Supabase PostgreSQL, paired with a persistent file fallback for seamless local evaluation:

1. **Primary: Supabase PostgreSQL**
   - Tables: `categories`, `products`, `orders`, `order_items` with foreign keys, checks, and unique indexes.
   - Authoritative calculations: All order line totals, subtotals, and final totals are recalculated on the server from stored product prices.
   - Concurrency & Stock: Checks stock at submission time, decrements stock atomically, and restores stock exactly once upon cancellation.
   - Snapshot preservation: `product_name_snapshot` and `unit_price_snapshot` are locked onto `order_items` at checkout.
2. **Fallback: Local Persistent JSON (`.data/demo-db.json`)**
   - If Supabase environment variables are omitted or invalid, the app automatically reads/writes to `.data/demo-db.json` so reviewers can test the full customer-to-admin lifecycle without setting up third-party services.
   - *Limitation*: The local JSON fallback operates on the host file system and is designed for single-node development/testing, not multi-instance scaling.
3. **Client Cart: `localStorage`**
   - The shopping cart lives in browser `localStorage` (`spare_parts_cart_v1`) to persist across page refreshes.
   - *Limitation*: `localStorage` is scoped to a single browser profile and is editable via DevTools. Authoritative validation and price checks happen on the server during checkout.

---

## 3. Data Model & System Flow

```
+---------------+        1:N        +---------------+
|  categories   | ----------------< |   products    |
+---------------+                   +---------------+
       |                                   |
       | (on delete restrict)              | (on delete restrict)
       |                                   |
       |                            +---------------+
       |                            |  order_items  |
       |                            +---------------+
       |                                   |
       |                                   | N:1
       v                                   v
[ Delete blocked if products exist ]   +---------------+
                                       |    orders     |
                                       +---------------+
```

- **Order Status Progression**:
  `Pending` → `Confirmed` → `Preparing` → `Shipped` → `Completed`
  - Cancellation is strictly restricted to `Pending` and `Confirmed` statuses.
  - When an eligible order is cancelled, inventory is restored to `products` exactly once (`stock_restored = true`).
  - `Completed` and `Cancelled` are terminal statuses.
- **Derived Customers**:
  - The customer directory is derived dynamically from unique normalized emails (`lower(trim(email))`) across submitted orders.
  - Repeat customers accumulate `order_count`, use the latest submitted contact information, and sum lifetime completed spending (`total_completed_spent`).

---

## 4. Routes

### Customer Website
- `/` — Home page (store branding, promotional banner, category tiles, featured products, fictional footer contact)
- `/products` — Product listing page (responsive grid, case-insensitive search, category filters, price sorting, View Details, Add to Cart, empty state)
- `/products/[id]` — Product details page (description, stock badge, quantity selector, related category products; blocks inactive items)
- `/cart` — Persistent shopping cart (line totals, quantity controls capped at available stock, subtotal = total, empty state)
- `/checkout` — Guest checkout form (name, email, phone, delivery address, sample payment method, order notes, server price/stock recheck)
- `/order-confirmation/[orderNumber]` — Order confirmation page (order number, customer details, itemized receipt, pending status, email dispatch feedback)

### Admin Dashboard
- `/admin/login` — Demo administrator sign-in (explicitly labeled demo authentication)
- `/admin` — Overview dashboard (Total Products, Total Orders, Pending / Completed Orders, Total Customers, Completed Sales, recent orders)
- `/admin/products` — Product management (search, category/status filters, create, edit, delete protection if referenced by orders with inactive toggle)
- `/admin/categories` — Category management (view, add, edit, delete blocked if products assigned, case-insensitive duplicate check)
- `/admin/orders` — Order management (newest-first list, status filter, view details)
- `/admin/orders/[id]` — Order details (customer info, delivery address, purchased items snapshots, safe status transitions, single stock restore on cancellation)
- `/admin/customers` — Read-only customer summary derived from order history

---

## 5. Demo Admin Credentials

- **Email**: `admin@spareparts.demo`
- **Password**: `cubetech-demo`

> **Note**: For assessment demo purposes only — unsuitable for production security. Session tokens are signed via HMAC cookie (`sp_admin_session`).

---

## 6. Setup & Running Locally

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy the template file:
```bash
cp .env.example .env.local
```

Fill in your variables in `.env.local` (or `.env`):
```ini
# Supabase credentials (from project settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Direct postgres connection string for automated seed script (npm run db:seed)
DIRECT_URL=postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Optional Resend order confirmation email delivery
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Spare Parts <onboarding@resend.dev>

# Demo admin credentials
DEMO_ADMIN_EMAIL=admin@spareparts.demo
DEMO_ADMIN_PASSWORD=cubetech-demo
```

*(Note: If Supabase keys are not provided, the app will run cleanly on local JSON fallback at `.data/demo-db.json`.)*

### Step 3: Seed the Database
To apply the PostgreSQL schema and seed 3 categories, 12 products (including 1 out-of-stock active item and 1 inactive item), and 2 sample orders:

- **Option A (Automated CLI Script)**:
  ```bash
  npm run db:seed
  ```
- **Option B (Supabase Web SQL Editor)**:
  1. Open your Supabase project dashboard → **SQL Editor**.
  2. Paste and run `supabase/schema.sql`.
  3. Paste and run `supabase/seed.sql`.

### Step 4: Run the Development Server
```bash
npm run dev
```

Open `http://localhost:3000` for the storefront, and `http://localhost:3000/admin/login` for the admin dashboard.

### Step 5: Production Build Verification
```bash
npm run build
```

---

## 7. Acceptance Checks Test Log (Section 17)

| ID | Acceptance Check | Result | Short Note |
|---|---|:---:|---|
| **01** | Search, category filter, and both price sorts work together. No-match and invalid product states are handled. | **PASS** | Multi-filter combines search string, category checkboxes, price range, and low/high sorting. Shows clear empty state when no products match. |
| **02** | Cart merges duplicate products, persists after refresh, and calculates the PHP 325.50 example correctly. | **PASS** | Re-adding increments item quantity; persisted in `localStorage`. 2 × PHP 120.00 + 1 × PHP 85.50 yields exactly PHP 325.50 without rounding errors. |
| **03** | Empty checkout, invalid customer fields, and invalid/excessive quantities are blocked. | **PASS** | Validates name (non-blank), valid email regex, 5+ digit phone, address, and positive integer quantity ≤ stock. |
| **04** | Inactive/out-of-stock items cannot be ordered. Checkout detects price or availability changes before saving. | **PASS** | Inactive `SP-03.4` is hidden from storefront and direct link is blocked. Zero-stock `SP-02.3` shows Out of Stock with disabled button. Server re-checks stock/prices at submission and returns review error on change. |
| **05** | A successful order shows confirmation, appears in admin, reduces stock, and clears the cart. Failed saves preserve the cart. | **PASS** | Order saved atomically, generates unique `ORD-xxxx`, decrements product stock, clears cart on success, and keeps cart intact on server/network failure. |
| **06** | Admin product/category changes appear on the customer site after refresh. Referenced records cannot be deleted. | **PASS** | Products referenced in past orders block hard deletion and offer an "Inactive" toggle. Categories with assigned products block deletion with explanatory feedback. |
| **07** | Valid statuses save; invalid transitions fail. Eligible cancellation restores stock once, including after refresh. | **PASS** | Follows `Pending → Confirmed → Preparing → Shipped → Completed`. Only `Pending` or `Confirmed` can be cancelled. `stock_restored` flag guarantees inventory is replenished exactly once. |
| **08** | Completed-order totals and unique-email customer counts match the underlying orders. | **PASS** | Total Sales calculates only `status === 'Completed'`. Customer count normalizes emails to lowercase trimmed values, summing lifetime completed spend. |
| **09** | Existing order prices/names remain unchanged after product edits. Data persists as described for the chosen approach. | **PASS** | `order_items` stores frozen name and unit price snapshots. Editing a product does not alter historic orders. |
| **10** | Customer/admin screens work at approximately 375 px and 1280 px widths. No clipped controls, horizontal page scrolling, or major console errors. | **PASS** | Responsive grids (4 cols desktop, 2–3 cols tablet, 2 cols mobile, 1 col narrow); inputs, modals, sidebars, and tables have overflow wrappers with zero horizontal page break. |

---

## 8. Explanations & Disclosures (Section 18)

- **AI Tools Used**: Google DeepMind Antigravity / Gemini for scaffolding repetitive component structures, image asset generation, and verifying test scenarios.
- **Templates & Third-Party Code**: Next.js App Router starter, Tailwind CSS v4, Lucide icons, `@supabase/supabase-js`, `resend`, and `pg`. All e-commerce business logic, status machines, money calculations, and database integrations were written for this assessment.
- **Known Issues / Unfinished Requirements**: None. All required customer website and admin dashboard features, business rules, and constraints specified in the assessment guide have been fully implemented and verified.
