alter table stores
  add column if not exists country text not null default 'Cuba';

alter table products
  add column if not exists country text not null default 'Cuba';

alter table seller_applications
  add column if not exists country text not null default 'Cuba';

update stores
set country = 'Cuba'
where country is null or country = '';

update products
set country = 'Cuba'
where country is null or country = '';

update seller_applications
set country = 'Cuba'
where country is null or country = '';

create index if not exists stores_country_region_idx
  on stores (country, province, municipality, status, is_active);

create index if not exists products_country_region_idx
  on products (country, province, municipality, status, is_active);

create index if not exists seller_applications_country_region_idx
  on seller_applications (country, province, municipality, status);
