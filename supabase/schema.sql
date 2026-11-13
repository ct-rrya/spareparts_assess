-- spare parts database schema for supabase (postgres)
-- run this in the supabase sql editor before running seed.sql

create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  slug text not null unique,
  description text default '',
  created_at timestamptz not null default now()
);

-- case-insensitive unique category name check
create unique index if not exists categories_name_lower_idx on categories (lower(trim(name)));

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  specimen_code text not null unique,
  name text not null,
  slug text not null unique,
  category_id uuid not null references categories(id) on delete restrict,
  description text not null default '',
  price numeric(10, 2) not null check (price > 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text not null default '',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  contact_number text not null,
  delivery_address text not null,
  payment_method text not null check (payment_method in ('Cash on Delivery', 'E-Wallet', 'Bank Transfer')),
  order_notes text default '',
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Preparing', 'Shipped', 'Completed', 'Cancelled')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  total numeric(10, 2) not null check (total >= 0),
  stock_restored boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete restrict,
  product_name_snapshot text not null,
  specimen_code_snapshot text not null default '',
  unit_price_snapshot numeric(10, 2) not null check (unit_price_snapshot > 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0)
);

-- open rls policies for the assessment demo (server routes still validate everything)
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);
drop policy if exists "demo write categories" on categories;
create policy "demo write categories" on categories for all using (true) with check (true);

drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);
drop policy if exists "demo write products" on products;
create policy "demo write products" on products for all using (true) with check (true);

drop policy if exists "demo access orders" on orders;
create policy "demo access orders" on orders for all using (true) with check (true);

drop policy if exists "demo access order_items" on order_items;
create policy "demo access order_items" on order_items for all using (true) with check (true);

