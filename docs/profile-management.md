# Gestion De Perfil

El usuario administra su cuenta en `/account`.

## Datos

- Nombre completo.
- Telefono.
- Pais.
- Direccion.
- WhatsApp.
- Bio.
- Idioma.
- Zona horaria.
- Preferencias de correo y WhatsApp.

## Avatar

La foto se sube al bucket `avatars`.

Reglas:

- Imagen solamente.
- Maximo 2 MB.
- Ruta por usuario: `USER_ID/archivo`.
- URL publica guardada en `profiles.avatar_url`.

## Seguridad

`/account/security` permite cambiar contrasena, revisar correo y cerrar sesion.
