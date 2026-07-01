# Storage Avatars

Bucket:

- `avatars`

La migracion `011_user_profile_module.sql` crea el bucket como publico y agrega politicas basicas.

## Politicas

- Lectura publica de avatars.
- Usuario autenticado sube solo dentro de su carpeta `USER_ID/`.
- Usuario puede actualizar o borrar objetos de su carpeta.

## Server Action

`uploadAvatar` usa service role para subir la imagen y guardar `profiles.avatar_url`.

## Limites

- Solo imagenes.
- Maximo 2 MB.
- En produccion se recomienda optimizar imagen y generar miniaturas.
