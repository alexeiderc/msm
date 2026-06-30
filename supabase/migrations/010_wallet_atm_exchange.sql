do $$ begin
  create type atm_status as enum ('activo', 'mantenimiento', 'fuera_servicio');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type atm_reservation_status as enum ('pendiente_pago', 'pago_confirmado', 'reservado', 'listo_para_retirar', 'entregado', 'expirado', 'cancelado');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type atm_operation_type as enum ('reserva_efectivo', 'remesa', 'cambio_divisa', 'pago_qr', 'recarga_billetera', 'retiro_billetera');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type wallet_transaction_status as enum ('pendiente', 'confirmado', 'fallido', 'cancelado');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type wallet_transaction_type as enum ('credito', 'debito', 'reserva', 'reverso', 'ajuste');
exception when duplicate_object then null;
end $$;

create table if not exists wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  currency text not null,
  balance numeric(14,2) not null default 0,
  reserved_balance numeric(14,2) not null default 0,
  status text not null default 'activa',
  risk_hold boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, currency)
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallet_accounts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type wallet_transaction_type not null,
  status wallet_transaction_status not null default 'pendiente',
  amount numeric(14,2) not null,
  currency text not null,
  reference_type text,
  reference_id uuid,
  note text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists atm_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'Cuba',
  province text not null,
  municipality text not null,
  zone text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now()
);

create table if not exists atm_machines (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  location_id uuid references atm_locations(id) on delete set null,
  status atm_status not null default 'activo',
  daily_limit numeric(14,2) not null default 0,
  technician_name text,
  last_sync_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists atm_cash_inventory (
  id uuid primary key default gen_random_uuid(),
  atm_id uuid not null references atm_machines(id) on delete cascade,
  currency text not null,
  available_amount numeric(14,2) not null default 0,
  reserved_amount numeric(14,2) not null default 0,
  minimum_amount numeric(14,2) not null default 0,
  status text not null default 'disponible',
  updated_at timestamptz not null default now(),
  unique (atm_id, currency)
);

create table if not exists atm_reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_number text not null unique,
  customer_id uuid references profiles(id) on delete set null,
  atm_id uuid references atm_machines(id) on delete set null,
  vip_store_id uuid references stores(id) on delete set null,
  country text not null default 'Cuba',
  province text not null,
  municipality text not null,
  currency text not null,
  amount numeric(14,2) not null,
  payment_method text,
  status atm_reservation_status not null default 'pendiente_pago',
  qr_code_hash text,
  qr_expires_at timestamptz,
  ready_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists atm_qr_sessions (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references atm_reservations(id) on delete cascade,
  qr_code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists atm_operations (
  id uuid primary key default gen_random_uuid(),
  operation_number text not null unique,
  type atm_operation_type not null,
  atm_id uuid references atm_machines(id) on delete set null,
  reservation_id uuid references atm_reservations(id) on delete set null,
  customer_id uuid references profiles(id) on delete set null,
  seller_id uuid references sellers(id) on delete set null,
  amount numeric(14,2) not null,
  currency text not null,
  status text not null default 'pendiente',
  evidence_url text,
  ledger_entry_id uuid references ledger_entries(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists wallet_accounts_user_idx on wallet_accounts(user_id);
create index if not exists wallet_transactions_user_idx on wallet_transactions(user_id, created_at);
create index if not exists atm_locations_zone_idx on atm_locations(country, province, municipality);
create index if not exists atm_machines_status_idx on atm_machines(status);
create index if not exists atm_reservations_zone_status_idx on atm_reservations(country, province, municipality, status);
create index if not exists atm_operations_type_status_idx on atm_operations(type, status);
