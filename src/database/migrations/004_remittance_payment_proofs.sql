create table remittance_payment_proofs (
  id uuid primary key default gen_random_uuid(),
  remittance_id uuid not null references remittances(id) on delete cascade,
  customer_id uuid not null references profiles(id),
  payment_method_id uuid not null references payment_methods(id),
  payment_account_id uuid references payment_accounts(id),
  image_url text not null,
  reference text not null,
  amount numeric(12,2) not null,
  currency text not null,
  country text not null,
  sender_name text not null,
  paid_at timestamptz not null,
  fingerprint text,
  status payment_proof_status not null default 'recibido',
  created_at timestamptz not null default now()
);

create table remittance_payment_reviews (
  id uuid primary key default gen_random_uuid(),
  proof_id uuid not null references remittance_payment_proofs(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  decision payment_proof_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index remittance_payment_proofs_status_idx on remittance_payment_proofs(remittance_id, status);
create index remittance_payment_proofs_fingerprint_idx on remittance_payment_proofs(reference, amount, currency);

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('payment-proofs', 'payment-proofs', true)
    on conflict (id) do nothing;
  end if;
end $$;

alter table remittance_payment_proofs enable row level security;
alter table remittance_payment_reviews enable row level security;

create policy "customers manage own remittance proofs" on remittance_payment_proofs
  for all using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

create policy "economic admins read remittance proofs" on remittance_payment_proofs
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('administrador_economico', 'administrador', 'superadmin')
    )
  );

create policy "economic admins update remittance proofs" on remittance_payment_proofs
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('administrador_economico', 'administrador', 'superadmin')
    )
  );

create policy "economic admins manage remittance reviews" on remittance_payment_reviews
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('administrador_economico', 'administrador', 'superadmin')
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('administrador_economico', 'administrador', 'superadmin')
    )
  );
