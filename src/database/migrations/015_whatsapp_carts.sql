-- 015_whatsapp_carts.sql
-- Pedidos enviados por WhatsApp (flujo demo sin registro) + settings de configuración

-- Settings genéricos (key/value)
create table if not exists settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pedidos WhatsApp (guest permitido: user_id nullable)
create table if not exists whatsapp_carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text not null,
  delivery_province text not null,
  delivery_municipality text not null,
  beneficiary_name text,
  beneficiary_phone text,
  total_amount numeric(12,2) not null default 0,
  whatsapp_number text not null,
  status text not null default 'enviado',
  tracking_code text,
  fee_amount numeric(12,2),
  admin_link text,
  admin_notes text,
  viewed_at timestamptz,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Si la tabla ya existía con user_id NOT NULL, la hacemos nullable
alter table whatsapp_carts alter column user_id drop not null;

create index if not exists whatsapp_carts_status_idx on whatsapp_carts(status);
create index if not exists whatsapp_carts_sent_at_idx on whatsapp_carts(sent_at desc);
create index if not exists whatsapp_carts_user_idx on whatsapp_carts(user_id);
create index if not exists whatsapp_carts_phone_idx on whatsapp_carts(customer_phone);

alter table settings enable row level security;
alter table whatsapp_carts enable row level security;

-- Settings: solo admin/superadmin
drop policy if exists "settings admin all" on settings;
create policy "settings admin all" on settings
  for all using (public.current_role() in ('administrador', 'superadmin'));

-- WhatsApp carts: admin lee todo; insert abierto (guest + service role)
drop policy if exists "whatsapp_carts admin read" on whatsapp_carts;
create policy "whatsapp_carts admin read" on whatsapp_carts
  for select using (
    public.current_role() in ('administrador', 'administrador_economico', 'superadmin')
    or user_id = auth.uid()
  );

drop policy if exists "whatsapp_carts insert" on whatsapp_carts;
create policy "whatsapp_carts insert" on whatsapp_carts
  for insert with check (true);

drop policy if exists "whatsapp_carts admin update" on whatsapp_carts;
create policy "whatsapp_carts admin update" on whatsapp_carts
  for update using (public.current_role() in ('administrador', 'administrador_economico', 'superadmin'));

-- Nota: las acciones server usan createAdminClient (service role) y bypassean RLS.
