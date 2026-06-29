# Supabase Setup

## Crear proyecto

1. Crea un proyecto Supabase.
2. Copia Project URL y anon public key.
3. Copia service role key solo para servidor.
4. Obtén connection strings de Postgres para `DATABASE_URL` y `DIRECT_URL`.

## Variables locales

Crea `.env.local` con:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
RESEND_API_KEY=
MSM_COMMERCIAL_EMAIL=commercial@msmmystore.com
WHATSAPP_API_BASE_URL=
WHATSAPP_API_TOKEN=
BETA_MODE=true
```

## Migraciones SQL

En Supabase SQL Editor, ejecuta en orden:

1. `src/database/migrations/001_initial.sql`
2. `src/database/migrations/002_advanced_operations.sql`

Alternativa con Supabase CLI: copia los SQL a la carpeta de migraciones del CLI y ejecuta `supabase db push`.

## Prisma

Genera cliente:

```bash
pnpm db:generate
```

Para empujar el schema Prisma a una base de desarrollo:

```bash
pnpm db:push
```

En produccion, usa las migraciones SQL revisadas antes de aplicar cambios.

## Seed

Luego de configurar `DATABASE_URL`:

```bash
pnpm db:seed
```

El seed crea categorias, provincias, metodos de pago demo y plantillas de notificacion. No usa cuentas reales.

El seed no crea usuarios dentro de Supabase Auth. Si ya existe un perfil en `profiles` con rol `vendedor_vip`, tambien crea una tienda demo y un producto activo para probar checkout. Si no existe ese perfil, omite tienda/producto y puedes crearlos desde `/dashboard/vip` despues de entrar con un vendedor aprobado.

## Storage

Crea buckets:

- `product-images`
- `kyc-documents`
- `delivery-evidence`
- `payment-proofs`
- `support-evidence`

Recomendacion: buckets privados y URLs firmadas para KYC, comprobantes, soporte y evidencia de entrega.

## Primer administrador

1. Crea el usuario desde Supabase Auth.
2. Copia su `auth.users.id`.
3. Inserta o actualiza `profiles`:

```sql
insert into profiles (id, email, full_name, role)
values ('AUTH_USER_ID', 'admin@msmmystore.com', 'Administrador MSM', 'superadmin')
on conflict (id) do update set role = 'superadmin';
```

Para administrador economico:

```sql
update profiles set role = 'administrador_economico' where email = 'economia@msmmystore.com';
```

Activa MFA para perfiles administrativos.
