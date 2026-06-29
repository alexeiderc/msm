# Deployment

## Preflight local

```bash
pnpm install
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm build
```

## GitHub

1. Crea un repositorio privado en GitHub.
2. Inicializa git local si aun no existe.
3. Agrega todos los archivos excepto `.env.local`, `.next`, `node_modules` y `work`.
4. Haz commit y push a `main`.

```bash
git init
git add .
git commit -m "Initial MSM MY STORE MVP"
git branch -M main
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

## Vercel

1. Importa el repo desde Vercel.
2. Framework: Next.js.
3. Install command: `pnpm install`.
4. Build command: `pnpm build`.
5. Output: automatico.
6. Agrega variables de entorno de produccion.
7. Deploy.

## Variables en Vercel

```bash
NEXT_PUBLIC_SITE_URL=https://msmmystore.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
RESEND_API_KEY=
MSM_COMMERCIAL_EMAIL=commercial@msmmystore.com
WHATSAPP_API_BASE_URL=
WHATSAPP_API_TOKEN=
BETA_MODE=true
NEXT_PUBLIC_PWA_ENABLED=true
```

`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY` y `WHATSAPP_API_TOKEN` son secretos de servidor. No deben exponerse en cliente ni en GitHub.

## Dominio msmmystore.com

Opcion recomendada: desplegar la app completa en `msmmystore.com`. La ruta `/` es la entrada principal de MSM MY STORE y `/products` concentra productos y servicios.

Si `msmmystore.com` ya apunta a otra web, usa una de estas opciones:

- Hacer backup del sitio viejo antes de cambiar DNS o reemplazar hosting.
- Desplegar primero en preview de Vercel y revisar todo el flujo.
- Usar `marketplace.msmmystore.com` o `msmmystore.com/marketplace` solo para beta, pruebas o compatibilidad.
- Mantener redirects para que enlaces viejos de `/marketplace` lleguen a la nueva experiencia principal.

En Vercel, agrega el dominio en Project Settings > Domains. Luego configura DNS segun Vercel indique.

## Antes de beta

- Activar `BETA_MODE=true`.
- Crear usuarios internos con MFA.
- Crear primer `superadmin`.
- Ejecutar migraciones SQL en Supabase.
- Ejecutar seed.
- Verificar Storage privado.
- Revisar textos legales.
- Probar flujo de orden completo con datos ficticios.
- Probar `/wallet`, `/exchange`, `/atm` y manifest PWA.
- Confirmar que service worker no cachea datos privados ni comprobantes.
