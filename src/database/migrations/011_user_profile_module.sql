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

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
