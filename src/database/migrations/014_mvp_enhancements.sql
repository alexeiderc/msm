-- 014_mvp_enhancements.sql: Discounts, Tax, Shipping, Reviews, Returns, Inventory, Analytics, Wishlist

-- 1. COUPONS
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null default 'percentage', -- percentage | fixed
  discount_value numeric(12,2) not null,
  min_order_amount numeric(12,2) default 0,
  max_uses integer not null default 0,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  customer_id uuid not null references profiles(id),
  discount_amount numeric(12,2) not null,
  used_at timestamptz not null default now()
);

-- 2. TAX RATES
create table if not exists tax_rates (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  province text,
  rate_percent numeric(5,2) not null,
  tax_name text not null default 'VAT',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. SHIPPING RATES
create table if not exists shipping_rates (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  province text,
  municipality text,
  min_order_amount numeric(12,2) default 0,
  cost numeric(12,2) not null default 0,
  estimated_days text default '3-5',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. PRODUCT REVIEWS
create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  customer_id uuid not null references profiles(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  images text[] default '{}',
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default false,
  moderated_by uuid references profiles(id),
  moderated_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. RETURNS
create table if not exists returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique,
  order_id uuid not null references orders(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,
  customer_id uuid not null references profiles(id),
  reason text not null,
  description text,
  evidence_urls text[] default '{}',
  status text not null default 'pendiente', -- pendiente | aprobado | rechazado | en_transito | recibido | reembolsado
  resolution_type text, -- refund | replacement | store_credit
  resolution_amount numeric(12,2),
  refund_wallet_transaction_id uuid references wallet_transactions(id),
  admin_id uuid references profiles(id),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. INVENTORY TRANSACTIONS
create table if not exists inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  store_id uuid references stores(id),
  quantity_change integer not null,
  stock_before integer not null default 0,
  stock_after integer not null default 0,
  reason text not null, -- order | return | adjustment | restock | cancellation
  reference_type text, -- order | return
  reference_id uuid,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- 7. ANALYTICS EVENTS (lightweight)
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  profile_id uuid references profiles(id) on delete set null,
  properties jsonb not null default '{}'::jsonb,
  session_id text,
  created_at timestamptz not null default now()
);

-- 8. WISHLIST
create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(profile_id, product_id)
);

-- 9. ALTER ORDERS
alter table orders add column if not exists coupon_id uuid references coupons(id) on delete set null;
alter table orders add column if not exists discount_amount numeric(12,2) not null default 0;
alter table orders add column if not exists tax_amount numeric(12,2) not null default 0;
alter table orders add column if not exists shipping_cost numeric(12,2) not null default 0;
alter table orders add column if not exists shipping_rate_id uuid references shipping_rates(id) on delete set null;

-- 10. ALTER ORDER ITEMS
alter table order_items add column if not exists discount_amount numeric(12,2) not null default 0;
alter table order_items add column if not exists tax_amount numeric(12,2) not null default 0;

-- 11. ALTER PRODUCTS
alter table products add column if not exists low_stock_threshold integer not null default 5;
alter table products add column if not exists last_inventory_update timestamptz;

-- INDEXES
create index if not exists coupons_code_idx on coupons(code);
create index if not exists coupons_active_idx on coupons(is_active, starts_at, expires_at);
create index if not exists coupon_usage_order_idx on coupon_usage(order_id);
create index if not exists coupon_usage_customer_idx on coupon_usage(customer_id);
create index if not exists tax_rates_country_idx on tax_rates(country, province);
create index if not exists shipping_rates_zone_idx on shipping_rates(country, province, municipality);
create index if not exists product_reviews_product_idx on product_reviews(product_id, is_approved);
create index if not exists returns_order_idx on returns(order_id);
create index if not exists returns_customer_idx on returns(customer_id);
create index if not exists inventory_product_idx on inventory_transactions(product_id, created_at);
create index if not exists analytics_events_type_idx on analytics_events(event_type, created_at);
create index if not exists wishlist_profile_idx on wishlist_items(profile_id);
create index if not exists orders_coupon_idx on orders(coupon_id);

-- RLS
alter table coupons enable row level security;
alter table coupon_usage enable row level security;
alter table tax_rates enable row level security;
alter table shipping_rates enable row level security;
alter table product_reviews enable row level security;
alter table returns enable row level security;
alter table inventory_transactions enable row level security;
alter table analytics_events enable row level security;
alter table wishlist_items enable row level security;

-- Coupons: admin CRUD, public read active
drop policy if exists "coupons admin all" on coupons;
create policy "coupons admin all" on coupons
  for all using (public.current_role() in ('administrador', 'superadmin'));

drop policy if exists "coupons public read active" on coupons;
create policy "coupons public read active" on coupons
  for select using (is_active = true and (starts_at is null or starts_at <= now()) and (expires_at is null or expires_at >= now()));

-- Coupon usage: admin read, insert by system
drop policy if exists "coupon_usage admin read" on coupon_usage;
create policy "coupon_usage admin read" on coupon_usage
  for select using (public.current_role() in ('administrador', 'superadmin'));

-- Tax rates: admin CRUD, public read active
drop policy if exists "tax_rates admin all" on tax_rates;
create policy "tax_rates admin all" on tax_rates
  for all using (public.current_role() in ('administrador', 'superadmin'));

drop policy if exists "tax_rates public read" on tax_rates;
create policy "tax_rates public read" on tax_rates
  for select using (is_active = true);

-- Shipping rates: admin CRUD, public read active
drop policy if exists "shipping_rates admin all" on shipping_rates;
create policy "shipping_rates admin all" on shipping_rates
  for all using (public.current_role() in ('administrador', 'superadmin'));

drop policy if exists "shipping_rates public read" on shipping_rates;
create policy "shipping_rates public read" on shipping_rates
  for select using (is_active = true);

-- Product reviews: customers create own, admin moderate, public read approved
drop policy if exists "product_reviews customer insert" on product_reviews;
create policy "product_reviews customer insert" on product_reviews
  for insert with check (customer_id = auth.uid());

drop policy if exists "product_reviews public read approved" on product_reviews;
create policy "product_reviews public read approved" on product_reviews
  for select using (is_approved = true or customer_id = auth.uid() or public.current_role() in ('administrador', 'superadmin'));

drop policy if exists "product_reviews admin update" on product_reviews;
create policy "product_reviews admin update" on product_reviews
  for update using (public.current_role() in ('administrador', 'superadmin'));

-- Returns: customer own CRUD, admin all
drop policy if exists "returns customer insert" on returns;
create policy "returns customer insert" on returns
  for insert with check (customer_id = auth.uid());

drop policy if exists "returns customer select" on returns;
create policy "returns customer select" on returns
  for select using (customer_id = auth.uid() or public.current_role() in ('administrador', 'superadmin'));

drop policy if exists "returns admin update" on returns;
create policy "returns admin update" on returns
  for update using (public.current_role() in ('administrador', 'superadmin'));

-- Inventory: admin all
drop policy if exists "inventory admin all" on inventory_transactions;
create policy "inventory admin all" on inventory_transactions
  for all using (public.current_role() in ('administrador', 'superadmin'));

drop policy if exists "inventory read" on inventory_transactions;
create policy "inventory read" on inventory_transactions
  for select using (public.current_role() in ('administrador', 'vendedor_vip', 'superadmin'));

-- Analytics: insert by system, admin read
drop policy if exists "analytics insert" on analytics_events;
create policy "analytics insert" on analytics_events
  for insert with check (true);

drop policy if exists "analytics admin read" on analytics_events;
create policy "analytics admin read" on analytics_events
  for select using (public.current_role() in ('administrador', 'superadmin'));

-- Wishlist: customer own CRUD
drop policy if exists "wishlist customer all" on wishlist_items;
create policy "wishlist customer all" on wishlist_items
  for all using (profile_id = auth.uid());
