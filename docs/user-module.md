# Modulo De Usuarios

MSM MY STORE usa Supabase Auth para identidad y `profiles` para datos operativos.

## Rutas

- `/auth/login`: inicio de sesion.
- `/auth/signup`: registro cliente o intencion vendedor VIP.
- `/auth/forgot-password`: solicitar recuperacion.
- `/auth/reset-password`: guardar nueva contrasena.
- `/auth/logout`: cerrar sesion.
- `/account`: perfil completo.
- `/account/profile`: alias de perfil.
- `/account/security`: contrasena, sesion y seguridad.
- `/account/kyc`: KYC cliente y politica antifraude.
- `/dashboard/admin/users`: administracion de usuarios.
- `/dashboard/admin/users/[userId]`: detalle, rol, estado, KYC y auditoria.

## Campos Nuevos

Migracion: `011_user_profile_module.sql`.

- `status`
- `avatar_url`
- `bio`
- `whatsapp`
- `preferred_language`
- `timezone`
- `notification_email_enabled`
- `notification_whatsapp_enabled`
- `last_login_at`
- `email_confirmed_at`
- `profile_completed_at`
- `admin_note`

## Reglas

- Cliente edita solo su perfil.
- Administrador ve usuarios y puede cambiar estado/KYC.
- Solo `superadmin` cambia roles.
- Un usuario no puede bloquearse a si mismo.
- Un administrador normal no puede modificar un superadmin.
- Acciones sensibles escriben `audit_logs`.
