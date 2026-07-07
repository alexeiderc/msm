create table if not exists wallet_load_requests (
  id uuid primary key default gen_random_uuid(),
  load_number text not null unique,
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  currency text not null default 'USD',
  country text not null,
  payment_method_id uuid references payment_methods(id) on delete set null,
  payment_account_id uuid references payment_accounts(id) on delete set null,
  sender_name text not null,
  reference text not null,
  proof_url text,
  note text,
  status text not null default 'pendiente_revision',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  reserve_currency text default 'USDT',
  reserve_rate numeric(14,6),
  reserve_amount numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wallet_load_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references wallet_load_requests(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  decision text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists wallet_holds (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallet_accounts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  currency text not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  status text not null default 'activo',
  expires_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists wallet_score_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source text not null default 'saldo_msm',
  event_type text not null,
  points integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table orders add column if not exists payment_mode text not null default 'manual';
alter table orders add column if not exists wallet_transaction_id uuid references wallet_transactions(id) on delete set null;

create index if not exists wallet_load_requests_user_status_idx on wallet_load_requests(user_id, status, created_at);
create index if not exists wallet_load_requests_review_idx on wallet_load_requests(status, created_at);
create index if not exists wallet_load_reviews_request_idx on wallet_load_reviews(request_id);
create index if not exists wallet_holds_user_status_idx on wallet_holds(user_id, status);
create index if not exists wallet_score_events_user_idx on wallet_score_events(user_id, created_at);

alter table wallet_accounts enable row level security;
alter table wallet_transactions enable row level security;
alter table wallet_load_requests enable row level security;
alter table wallet_load_reviews enable row level security;
alter table wallet_holds enable row level security;
alter table wallet_score_events enable row level security;

drop policy if exists "wallet accounts own or economic read" on wallet_accounts;
create policy "wallet accounts own or economic read" on wallet_accounts
  for select using (user_id = auth.uid() or public.current_role() in ('administrador_economico', 'superadmin'));

drop policy if exists "wallet transactions own or economic read" on wallet_transactions;
create policy "wallet transactions own or economic read" on wallet_transactions
  for select using (user_id = auth.uid() or public.current_role() in ('administrador_economico', 'superadmin'));

drop policy if exists "wallet load requests own or economic read" on wallet_load_requests;
create policy "wallet load requests own or economic read" on wallet_load_requests
  for select using (user_id = auth.uid() or public.current_role() in ('administrador_economico', 'superadmin'));

drop policy if exists "wallet load requests own insert" on wallet_load_requests;
create policy "wallet load requests own insert" on wallet_load_requests
  for insert with check (user_id = auth.uid());

drop policy if exists "wallet load requests economic update" on wallet_load_requests;
create policy "wallet load requests economic update" on wallet_load_requests
  for update using (public.current_role() in ('administrador_economico', 'superadmin'));

drop policy if exists "wallet load reviews economic read" on wallet_load_reviews;
create policy "wallet load reviews economic read" on wallet_load_reviews
  for select using (public.current_role() in ('administrador_economico', 'superadmin'));

drop policy if exists "wallet load reviews economic insert" on wallet_load_reviews;
create policy "wallet load reviews economic insert" on wallet_load_reviews
  for insert with check (public.current_role() in ('administrador_economico', 'superadmin'));

drop policy if exists "wallet holds own or economic read" on wallet_holds;
create policy "wallet holds own or economic read" on wallet_holds
  for select using (user_id = auth.uid() or public.current_role() in ('administrador_economico', 'superadmin'));

drop policy if exists "wallet score own or economic read" on wallet_score_events;
create policy "wallet score own or economic read" on wallet_score_events
  for select using (user_id = auth.uid() or public.current_role() in ('administrador_economico', 'superadmin'));
