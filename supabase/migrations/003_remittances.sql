create type remittance_status as enum (
  'pendiente_pago',
  'pago_recibido',
  'en_revision',
  'lista_para_entrega',
  'entregada',
  'cerrada',
  'incidencia',
  'cancelada'
);

create table remittances (
  id uuid primary key default gen_random_uuid(),
  remittance_number text not null unique,
  customer_id uuid not null references profiles(id),
  status remittance_status not null default 'pendiente_pago',
  sender_full_name text not null,
  sender_phone text not null,
  sender_country text not null,
  sender_currency text not null,
  send_amount numeric(12,2) not null,
  msm_fee numeric(12,2) not null,
  net_amount numeric(12,2) not null,
  recipient_full_name text not null,
  recipient_phone text not null,
  recipient_province text not null,
  recipient_municipality text not null,
  recipient_address text not null,
  payout_currency text not null,
  payout_method text not null,
  estimated_recipient_amount numeric(12,2),
  payment_method_id uuid not null references payment_methods(id),
  payment_account_id uuid references payment_accounts(id),
  note text,
  legal_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table remittance_events (
  id uuid primary key default gen_random_uuid(),
  remittance_id uuid not null references remittances(id) on delete cascade,
  status remittance_status not null,
  actor_id uuid references profiles(id),
  note text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index remittances_customer_status_idx on remittances(customer_id, status);
create index remittances_payment_status_idx on remittances(payment_method_id, status);

alter table remittances enable row level security;
alter table remittance_events enable row level security;

create policy "customers read own remittances" on remittances
  for select using (auth.uid() = customer_id);

create policy "customers create own remittances" on remittances
  for insert with check (auth.uid() = customer_id);

create policy "economic admins manage remittances" on remittances
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('administrador_economico', 'administrador', 'superadmin')
    )
  );

create policy "remittance events read parties" on remittance_events
  for select using (
    exists (
      select 1 from remittances
      where remittances.id = remittance_events.remittance_id
      and remittances.customer_id = auth.uid()
    )
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('administrador_economico', 'administrador', 'superadmin')
    )
  );

create policy "admins create remittance events" on remittance_events
  for insert with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('administrador_economico', 'administrador', 'superadmin')
    )
  );
