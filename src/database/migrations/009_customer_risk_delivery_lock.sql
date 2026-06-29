alter table profiles
  add column if not exists customer_risk_score integer not null default 0,
  add column if not exists customer_risk_reasons text[] not null default '{}',
  add column if not exists customer_last_risk_review_at timestamptz;

alter table orders
  add column if not exists customer_risk_score integer not null default 0,
  add column if not exists customer_risk_level text not null default 'normal',
  add column if not exists customer_risk_reasons text[] not null default '{}',
  add column if not exists vip_delivery_unlocked_at timestamptz,
  add column if not exists delivery_otp_code_hash text,
  add column if not exists delivery_otp_required boolean not null default true,
  add column if not exists delivery_otp_verified_at timestamptz,
  add column if not exists delivery_evidence_required boolean not null default true;

alter table delivery_evidence
  add column if not exists receiver_name text,
  add column if not exists receiver_document_last4 text,
  add column if not exists otp_verified boolean not null default false,
  add column if not exists evidence_quality_score integer not null default 0;

create index if not exists profiles_customer_risk_score_idx on profiles(customer_risk_score);
create index if not exists orders_customer_risk_level_idx on orders(customer_risk_level);
create index if not exists orders_vip_delivery_unlocked_at_idx on orders(vip_delivery_unlocked_at);
