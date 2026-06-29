# Deploy En Vercel

## Pasos

1. Subir el proyecto a GitHub.
2. Crear proyecto en Vercel.
3. Conectar repositorio.
4. Configurar variables de entorno.
5. Ejecutar deploy.
6. Conectar dominio `msmmystore.com`.

## Variables claves

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL=https://msmmystore.com`
- `NEXT_PUBLIC_PWA_ENABLED=true`

## Antes de publicar

- Correr migraciones en Supabase.
- Correr seed seguro.
- Crear primer superadmin.
- Revisar RLS.
- Revisar buckets privados.
- Confirmar dominio.
- Probar checkout, remesas, comprobantes y panel economico.
