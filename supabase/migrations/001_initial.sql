create extension if not exists "pgcrypto";

create type user_role as enum ('cliente', 'vendedor_vip', 'administrador', 'administrador_economico', 'superadmin');
create type order_status as enum ('pendiente_pago', 'pago_confirmado', 'asignada_vip', 'confirmada_vip', 'preparando', 'en_ruta', 'entregada', 'cerrada', 'incidencia', 'cancelada');
create type seller_level as enum ('vendedor_nuevo', 'vendedor_verificado', 'vendedor_destacado', 'vendedor_vip');
create type kyc_status as enum ('pendiente', 'aprobado', 'rechazado', 'requiere_revision');
create type ledger_type as enum ('venta', 'comision_msm', 'comision_pasarela', 'ajuste', 'payout');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  role user_role not null default 'cliente',
  address text,
  payment_method_valid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sellers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  level seller_level not null default 'vendedor_nuevo',
  status kyc_status not null default 'pendiente',
  commission_rate numeric(5,2) not null default 10,
  daily_capacity integer not null default 10,
  operation_zone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table seller_kyc (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null unique references sellers(id) on delete cascade,
  full_name text not null,
  phone text not null,
  document text not null,
  location text not null,
  operation_zone text not null,
  video_url text,
  community_verification_vip text,
  status kyc_status not null default 'pendiente',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  base_commission numeric(5,2) not null
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default false,
  delivery_zones text[] not null default '{}',
  weekly_hours jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  category_id uuid not null references categories(id),
  name text not null,
  slug text not null,
  description text,
  price numeric(12,2) not null,
  stock integer not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  position integer not null default 0
);

create table provinces (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table municipalities (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references provinces(id) on delete cascade,
  name text not null,
  unique (province_id, name)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references profiles(id),
  seller_id uuid references sellers(id),
  store_id uuid references stores(id),
  status order_status not null default 'pendiente_pago',
  receiver_full_name text not null,
  receiver_phone text not null,
  province_id uuid not null references provinces(id),
  municipality_id uuid not null references municipalities(id),
  address text not null,
  references text not null,
  delivery_window text not null,
  note text,
  subtotal numeric(12,2) not null,
  msm_commission numeric(12,2) not null,
  gateway_commission numeric(12,2) not null,
  seller_net numeric(12,2) not null,
  legal_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  name text not null,
  quantity integer not null,
  unit_price numeric(12,2) not null,
  total numeric(12,2) not null
);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  actor_id uuid,
  note text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table delivery_evidence (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  photo_url text,
  signature_url text,
  message text,
  otp_code_hash text,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null,
  provider_ref text,
  amount numeric(12,2) not null,
  status text not null,
  receipt_internal text,
  created_at timestamptz not null default now()
);

create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id),
  type ledger_type not null,
  amount numeric(12,2) not null,
  description text not null,
  order_id uuid,
  payout_id uuid,
  created_at timestamptz not null default now()
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id),
  amount numeric(12,2) not null,
  method text not null,
  reference text,
  receipt_url text,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default now()
);

create table commissions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid,
  rate numeric(5,2) not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id),
  order_id uuid,
  compliance integer not null check (compliance between 1 and 5),
  quality integer not null check (quality between 1 and 5),
  attention integer not null check (attention between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  opened_by_id uuid,
  status text not null,
  reason text not null,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  channel text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  ip text,
  created_at timestamptz not null default now()
);

create table terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  user_id uuid,
  version text not null,
  ip text,
  accepted_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table sellers enable row level security;
alter table seller_kyc enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
alter table delivery_evidence enable row level security;
alter table payments enable row level security;
alter table ledger_entries enable row level security;
alter table payouts enable row level security;
alter table audit_logs enable row level security;

create or replace function public.current_role()
returns user_role
language sql
stable
as $$
  select role from profiles where id = auth.uid()
$$;

create policy "public active stores" on stores for select using (is_active = true);
create policy "public active products" on products for select using (is_active = true);
create policy "profiles own read" on profiles for select using (id = auth.uid() or public.current_role() in ('administrador', 'superadmin'));
create policy "profiles own update" on profiles for update using (id = auth.uid());
create policy "seller own rows" on sellers for select using (profile_id = auth.uid() or public.current_role() in ('administrador', 'administrador_economico', 'superadmin'));
create policy "seller kyc own rows" on seller_kyc for select using (seller_id in (select id from sellers where profile_id = auth.uid()) or public.current_role() in ('administrador', 'superadmin'));
create policy "orders customer read" on orders for select using (customer_id = auth.uid() or public.current_role() in ('administrador', 'administrador_economico', 'superadmin') or seller_id in (select id from sellers where profile_id = auth.uid()));
create policy "orders customer insert" on orders for insert with check (customer_id = auth.uid());
create policy "order items read by order access" on order_items for select using (order_id in (select id from orders where customer_id = auth.uid() or public.current_role() in ('administrador', 'administrador_economico', 'superadmin') or seller_id in (select id from sellers where profile_id = auth.uid())));
create policy "ledger economic read" on ledger_entries for select using (public.current_role() in ('administrador_economico', 'superadmin') or seller_id in (select id from sellers where profile_id = auth.uid()));
create policy "audit admin read" on audit_logs for select using (public.current_role() in ('administrador', 'superadmin'));
