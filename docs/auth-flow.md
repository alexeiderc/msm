# Flujo De Autenticacion

## Registro

1. Usuario entra a `/auth/signup`.
2. Completa nombre, telefono, pais, correo, contrasena y acepta terminos.
3. Supabase Auth crea la cuenta.
4. Server Action crea o actualiza `profiles` con rol `cliente`.
5. Si quiere vender, continua en `/vendedores/solicitud`.

## Login

1. Usuario entra a `/auth/login`.
2. Supabase valida correo y contrasena.
3. MSM revisa `profiles.status`.
4. Si esta bloqueado, cierra sesion.
5. Si esta pausado, permite acceso a `/account` pero bloquea `/dashboard/*`.
6. Si esta activo, registra `last_login_at` y `audit_logs`.
7. Redirige segun rol.

## Callback Auth

Supabase confirma correo, magic links y recuperacion de contrasena via:

- `/auth/callback?next=/ruta-interna`

Flujo:

1. Supabase redirige al callback con `code`.
2. MSM intercambia el codigo por sesion.
3. Revisa `profiles.status`.
4. Redirige a `next` o al panel segun rol.

Redirects permitidos en Supabase Auth:

- `http://localhost:3000/auth/callback`
- `https://TU_DOMINIO/auth/callback`

Recuperacion de contrasena:

- `redirectTo` apunta a `/auth/callback?next=/auth/reset-password`
- El usuario guarda la nueva contrasena en `/auth/reset-password`

## Recuperacion

1. `/auth/forgot-password` envia enlace Supabase.
2. El enlace pasa por `/auth/callback?next=/auth/reset-password`.
3. El usuario guarda nueva contrasena.

## Produccion

Antes del beta publico:

- Confirmar email templates en Supabase.
- Configurar Site URL en Auth.
- Agregar `/auth/callback` a redirects permitidos.
- Ejecutar migracion `011_user_profile_module.sql` en Supabase live.
- Crear primer superadmin con `pnpm create-superadmin`.
- Activar MFA para cuentas admin.
