# Supabase Live Sync

## Proyecto

- Project ref: `vcfevlpoqwnsvkwfoprv`
- Project URL: `https://vcfevlpoqwnsvkwfoprv.supabase.co`

## Variables configuradas localmente

El archivo `.env.local` queda fuera de Git por `.gitignore`.

Variables necesarias:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

La `SUPABASE_SERVICE_ROLE_KEY` no debe publicarse en GitHub ni mostrarse en el frontend.

## Fases 1 a 4

Ejecuta en Windows:

```bat
run-supabase-phases-1-4.cmd
```

El script hace:

1. Verifica `.env.local`.
2. Instala Supabase CLI si no existe.
3. Ejecuta `supabase login`.
4. Ejecuta `supabase init` si falta configuración.
5. Copia migraciones desde `src/database/migrations` hacia `supabase/migrations`.
6. Ejecuta `supabase link --project-ref vcfevlpoqwnsvkwfoprv`.
7. Ejecuta `supabase db push`.
8. Ejecuta `pnpm db:generate`.
9. Ejecuta `pnpm db:seed`.

## Bloqueo en Codex

Desde la sesión sandbox de Codex no se pudo ejecutar directamente porque:

- Supabase CLI no está instalado.
- La sesión no tiene internet saliente disponible.
- No se permite elevar permisos para instalar CLI desde aquí.
- Prisma dentro del sandbox puede fallar por enlaces virtuales de `node_modules`.

Por eso el flujo real debe correrse desde la terminal normal de Windows.
