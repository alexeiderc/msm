alter table profiles
  add column if not exists country text,
  add column if not exists customer_kyc_status kyc_status not null default 'pendiente',
  add column if not exists customer_risk_level text not null default 'normal',
  add column if not exists identity_document_type text,
  add column if not exists identity_document_last4 text,
  add column if not exists payment_app_name text,
  add column if not exists payment_account_owner text,
  add column if not exists kyc_provider text,
  add column if not exists kyc_provider_reference text,
  add column if not exists kyc_checked_at timestamptz,
  add column if not exists chargeback_policy_accepted_at timestamptz,
  add column if not exists account_hold_reason text;

create index if not exists profiles_customer_kyc_status_idx on profiles(customer_kyc_status);
create index if not exists profiles_customer_risk_level_idx on profiles(customer_risk_level);

create table if not exists customer_kyc_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  reviewer_id uuid references profiles(id),
  status kyc_status not null default 'pendiente',
  risk_level text not null default 'normal',
  provider text,
  provider_reference text,
  decision_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table customer_kyc_reviews enable row level security;

drop policy if exists "customer kyc reviews own or admin read" on customer_kyc_reviews;
create policy "customer kyc reviews own or admin read" on customer_kyc_reviews
  for select using (
    profile_id = auth.uid()
    or public.current_role() in ('administrador', 'administrador_economico', 'superadmin')
  );

drop policy if exists "customer kyc reviews admin insert" on customer_kyc_reviews;
create policy "customer kyc reviews admin insert" on customer_kyc_reviews
  for insert with check (
    profile_id = auth.uid()
    or public.current_role() in ('administrador', 'administrador_economico', 'superadmin')
  );
