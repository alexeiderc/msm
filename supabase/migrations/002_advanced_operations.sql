create type payment_method_status as enum ('activo', 'pausado', 'oculto');
create type payment_account_status as enum ('activa', 'pausada', 'bloqueada');
create type payment_proof_status as enum ('recibido', 'aprobado', 'rechazado', 'nueva_evidencia');
create type seller_application_status as enum ('enviada', 'en_revision', 'aprobada', 'rechazada', 'mas_informacion', 'suspendida');
create type support_ticket_status as enum ('abierto', 'esperando_cliente', 'esperando_vip', 'en_revision', 'resuelto', 'cerrado');
create type support_reason as enum ('demora', 'producto_incorrecto', 'producto_danado', 'falta_de_entrega', 'garantia', 'otro');
create type support_resolution as enum ('reparacion', 'reemplazo', 'credito_interno', 'acuerdo_entre_partes', 'cierre_documentado');
create type notification_channel as enum ('email', 'whatsapp');
create type beta_access_status as enum ('pendiente', 'aprobado', 'rechazado');
create type fraud_severity as enum ('baja', 'media', 'alta', 'critica');
create type product_sla as enum ('h24', 'h48', 'h72', 'bajo_gestion');

alter table sellers add column if not exists max_confirm_minutes integer not null default 120;
alter table products add column if not exists promised_sla product_sla not null default 'h48';

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  currency text not null,
  type text not null,
  status payment_method_status not null default 'activo',
  min_amount numeric(12,2) not null,
  max_amount numeric(12,2) not null,
  fee_percent numeric(5,2) not null default 0,
  visible_instructions text not null,
  internal_instructions text,
  priority integer not null default 100,
  daily_capacity numeric(12,2) not null,
  responsible_economic_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payment_accounts (
  id uuid primary key default gen_random_uuid(),
  method_id uuid not null references payment_methods(id) on delete cascade,
  visible_name text not null,
  internal_alias text not null,
  daily_limit numeric(12,2) not null,
  received_today numeric(12,2) not null default 0,
  status payment_account_status not null default 'activa',
  expires_at timestamptz,
  internal_note text,
  usage_rules jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders add column if not exists payment_country text;
alter table orders add column if not exists payment_currency text;
alter table orders add column if not exists payment_method_id uuid references payment_methods(id);
alter table orders add column if not exists payment_account_id uuid references payment_accounts(id);
alter table orders add column if not exists vip_confirm_by timestamptz;

create table payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
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

create table payment_reviews (
  id uuid primary key default gen_random_uuid(),
  proof_id uuid not null references payment_proofs(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  decision payment_proof_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table seller_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  seller_id uuid references sellers(id),
  full_name text not null,
  phone text not null,
  province text not null,
  municipality text not null,
  origin_community text not null,
  contact_handle text not null,
  categories text[] not null default '{}',
  video_url text,
  product_photo_urls text[] not null default '{}',
  delivery_zone text not null,
  weekly_hours text not null,
  daily_capacity integer not null,
  offered_warranty text not null,
  agreement_accepted boolean not null default false,
  status seller_application_status not null default 'enviada',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table seller_agreements (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id),
  user_id uuid not null references profiles(id),
  version text not null,
  ip text,
  accepted_at timestamptz not null default now(),
  agreement_text text not null
);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  opened_by_id uuid not null references profiles(id),
  assigned_to_id uuid references profiles(id),
  reason support_reason not null,
  status support_ticket_status not null default 'abierto',
  subject text not null,
  resolution support_resolution,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body text not null,
  evidence_url text,
  internal_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table notification_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  channel notification_channel not null,
  subject text,
  body text not null,
  variables text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, channel)
);

create table beta_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  status beta_access_status not null default 'pendiente',
  note text,
  invited_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table fraud_alerts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  user_id uuid references profiles(id),
  type text not null,
  severity fraud_severity not null default 'media',
  message text not null,
  metadata jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table executive_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  metrics jsonb not null,
  created_by_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table payment_methods enable row level security;
alter table payment_accounts enable row level security;
alter table payment_proofs enable row level security;
alter table payment_reviews enable row level security;
alter table seller_applications enable row level security;
alter table seller_agreements enable row level security;
alter table support_tickets enable row level security;
alter table support_messages enable row level security;
alter table notification_templates enable row level security;
alter table beta_access enable row level security;
alter table fraud_alerts enable row level security;
alter table executive_reports enable row level security;

create policy "public active payment methods summary" on payment_methods
  for select using (status in ('activo', 'pausado'));

create policy "economic payment account access" on payment_accounts
  for select using (public.current_role() in ('administrador_economico', 'superadmin'));

create policy "customer proof own access" on payment_proofs
  for select using (customer_id = auth.uid() or public.current_role() in ('administrador_economico', 'superadmin'));

create policy "customer proof insert" on payment_proofs
  for insert with check (customer_id = auth.uid());

create policy "economic proof reviews" on payment_reviews
  for all using (public.current_role() in ('administrador_economico', 'superadmin'));

create policy "seller application public insert" on seller_applications
  for insert with check (true);

create policy "seller application admin read" on seller_applications
  for select using (profile_id = auth.uid() or public.current_role() in ('administrador', 'superadmin'));

create policy "seller agreements own read" on seller_agreements
  for select using (user_id = auth.uid() or public.current_role() in ('administrador', 'superadmin'));

create policy "support ticket parties read" on support_tickets
  for select using (opened_by_id = auth.uid() or assigned_to_id = auth.uid() or public.current_role() in ('administrador', 'superadmin'));

create policy "support ticket customer insert" on support_tickets
  for insert with check (opened_by_id = auth.uid());

create policy "support messages parties read" on support_messages
  for select using (
    ticket_id in (
      select id from support_tickets
      where opened_by_id = auth.uid() or assigned_to_id = auth.uid() or public.current_role() in ('administrador', 'superadmin')
    )
  );

create policy "notification templates admin read" on notification_templates
  for select using (public.current_role() in ('administrador', 'administrador_economico', 'superadmin'));

create policy "beta own read" on beta_access
  for select using (user_id = auth.uid() or public.current_role() in ('administrador', 'superadmin'));

create policy "fraud alerts admin read" on fraud_alerts
  for select using (public.current_role() in ('administrador', 'administrador_economico', 'superadmin'));

create policy "executive reports leadership read" on executive_reports
  for select using (public.current_role() in ('administrador', 'administrador_economico', 'superadmin'));
