const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:MSMDev2026**@db.vcfevlpoqwnsvkwfoprv.supabase.co:5432/postgres';

const migration011 = `
alter table profiles add column if not exists status text not null default 'activo';
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists whatsapp text;
alter table profiles add column if not exists preferred_language text not null default 'es';
alter table profiles add column if not exists timezone text not null default 'America/New_York';
alter table profiles add column if not exists notification_email_enabled boolean not null default true;
alter table profiles add column if not exists notification_whatsapp_enabled boolean not null default false;
alter table profiles add column if not exists last_login_at timestamptz;
alter table profiles add column if not exists email_confirmed_at timestamptz;
alter table profiles add column if not exists profile_completed_at timestamptz;
alter table profiles add column if not exists admin_note text;

create index if not exists profiles_role_status_idx on profiles(role, status);
create index if not exists profiles_email_search_idx on profiles using gin (to_tsvector('simple', coalesce(email, '') || ' ' || coalesce(full_name, '') || ' ' || coalesce(phone, '')));

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do update set public = true;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]) with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
`;

const migration012 = `
CREATE TABLE IF NOT EXISTS whatsapp_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    delivery_address TEXT,
    delivery_province TEXT,
    delivery_municipality TEXT,
    beneficiary_name TEXT,
    beneficiary_phone TEXT,
    total_amount DECIMAL(14, 2) NOT NULL,
    whatsapp_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'enviado',
    tracking_code TEXT,
    fee_amount DECIMAL(14, 2),
    admin_notes TEXT,
    admin_link TEXT,
    viewed_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_carts_user_id ON whatsapp_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_carts_status ON whatsapp_carts(status);
`;

async function main() {
  const client = new Client(DATABASE_URL);
  await client.connect();
  console.log('Conectado a Supabase production');

  try {
    console.log('Ejecutando 011_user_profile_module.sql...');
    await client.query(migration011);
    console.log('OK - 011 ejecutado');
  } catch (e) {
    console.error('ERROR en 011:', e.message);
  }

  try {
    console.log('Ejecutando 012_whatsapp_carts.sql...');
    await client.query(migration012);
    console.log('OK - 012 ejecutado');
  } catch (e) {
    console.error('ERROR en 012:', e.message);
  }

  await client.end();
  console.log('Migraciones completadas');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
