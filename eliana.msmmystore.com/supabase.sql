-- ELIANA - La Incubadora del Futuro
-- Ejecutar en el SQL Editor del proyecto Supabase de ELIANA.
-- La Service Role Key se usa unicamente en server.js. Nunca va en index.html o widget.js.

create extension if not exists pgcrypto;

create table if not exists public.membresias (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  plan text not null default 'gratis' check (plan in ('gratis', 'iniciado', 'dueno', 'maestro')),
  mensajes_usados int not null default 0 check (mensajes_usados >= 0),
  limite int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversaciones (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  mensaje_usuario text not null,
  respuesta_eliana text not null,
  plan text not null default 'gratis',
  created_at timestamptz not null default now()
);

create index if not exists conversaciones_email_created_at_idx
  on public.conversaciones (email, created_at desc);

-- Se conserva la configuracion solicitada. Los permisos directos anon/authenticated
-- se revocan: solamente el servidor con Service Role puede tocar estas tablas.
alter table public.membresias disable row level security;
alter table public.conversaciones disable row level security;
revoke all on table public.membresias from anon, authenticated;
revoke all on table public.conversaciones from anon, authenticated;

create or replace function public.eliana_plan_limit(plan_name text)
returns integer
language sql
immutable
as $$
  select case plan_name
    when 'gratis' then 5
    when 'iniciado' then 100
    when 'dueno' then 500
    when 'maestro' then -1
    else 5
  end;
$$;

create or replace function public.eliana_prepare_membership()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  new.limite := public.eliana_plan_limit(new.plan);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists eliana_membership_before_write on public.membresias;
create trigger eliana_membership_before_write
before insert or update of email, plan on public.membresias
for each row execute function public.eliana_prepare_membership();

-- Reserva el cupo de forma atomica para evitar que dos pestanas gasten el mismo mensaje.
create or replace function public.eliana_consume_message(p_email text)
returns table(plan text, mensajes_usados integer, limite integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  membership public.membresias%rowtype;
begin
  insert into public.membresias (email)
  values (lower(trim(p_email)))
  on conflict (email) do nothing;

  select * into membership
  from public.membresias
  where email = lower(trim(p_email))
  for update;

  if membership.limite >= 0 and membership.mensajes_usados >= membership.limite then
    raise exception 'ELIANA_QUOTA_REACHED';
  end if;

  update public.membresias
  set mensajes_usados = mensajes_usados + 1,
      updated_at = now()
  where id = membership.id
  returning public.membresias.plan,
            public.membresias.mensajes_usados,
            public.membresias.limite
  into plan, mensajes_usados, limite;

  return next;
end;
$$;

revoke all on function public.eliana_consume_message(text) from public, anon, authenticated;
grant execute on function public.eliana_consume_message(text) to service_role;

-- Activacion manual despues de confirmar el pago. Ejemplo:
-- update public.membresias set plan = 'iniciado' where email = 'cliente@correo.com';
