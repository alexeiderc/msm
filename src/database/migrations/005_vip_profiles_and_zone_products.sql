alter type seller_level add value if not exists 'super_vip';
alter type seller_level add value if not exists 'tienda_oficial';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_type') then
    create type store_type as enum ('vendedor_independiente', 'tienda_oficial');
  end if;
  if not exists (select 1 from pg_type where typname = 'store_status') then
    create type store_status as enum ('activo', 'pausado', 'suspendido');
  end if;
  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type product_status as enum ('borrador', 'activo', 'pausado', 'agotado');
  end if;
end $$;

alter table stores
  add column if not exists type store_type not null default 'vendedor_independiente',
  add column if not exists status store_status not null default 'pausado',
  add column if not exists owner_name text,
  add column if not exists company_name text,
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists email text,
  add column if not exists province text,
  add column if not exists municipality text,
  add column if not exists address text,
  add column if not exists warranty text,
  add column if not exists categories text[] not null default '{}',
  add column if not exists services_active text[] not null default '{}',
  add column if not exists pickup_available boolean not null default false,
  add column if not exists delivery_available boolean not null default true,
  add column if not exists transfer_available boolean not null default false,
  add column if not exists remittances_active boolean not null default false,
  add column if not exists remittance_delivery_methods text[] not null default '{}',
  add column if not exists remittance_municipalities text[] not null default '{}',
  add column if not exists cash_available numeric(12,2),
  add column if not exists remittance_daily_limit numeric(12,2),
  add column if not exists remittance_eta text,
  add column if not exists remittance_evidence_mode text,
  add column if not exists reputation_label text,
  add column if not exists is_featured boolean not null default false;

alter table products
  add column if not exists currency text not null default 'USD',
  add column if not exists subcategory text,
  add column if not exists province text,
  add column if not exists municipality text,
  add column if not exists delivery_zone text,
  add column if not exists warranty text,
  add column if not exists availability text,
  add column if not exists status product_status not null default 'borrador',
  add column if not exists featured boolean not null default false,
  add column if not exists internal_notes text;

alter table remittances
  add column if not exists assigned_seller_id uuid references sellers(id),
  add column if not exists vip_store_id uuid references stores(id);

update stores set status = 'activo' where is_active = true and status = 'pausado';
update products set status = 'activo' where is_active = true and status = 'borrador';

create index if not exists stores_public_zone_idx on stores(status, is_active, province, municipality, type);
create index if not exists products_public_zone_idx on products(status, is_active, province, municipality, category_id);
create index if not exists remittances_vip_zone_idx on remittances(vip_store_id, assigned_seller_id, recipient_province, recipient_municipality, status);

create or replace view public_active_products_by_zone as
select
  p.*,
  s.name as store_name,
  s.slug as store_slug,
  s.type as store_type,
  s.level,
  s.province as store_province,
  s.municipality as store_municipality
from products p
join stores st on st.id = p.store_id
join sellers s2 on s2.id = st.seller_id
join lateral (
  select st.name, st.slug, st.type, s2.level, st.province, st.municipality
) s on true
where p.is_active = true
  and p.status = 'activo'
  and st.is_active = true
  and st.status = 'activo'
  and coalesce(p.province, st.province) is not null
  and coalesce(p.municipality, st.municipality) is not null
  and p.store_id is not null;
