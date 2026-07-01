# Administracion De Usuarios

Ruta principal:

- `/dashboard/admin/users`

Detalle:

- `/dashboard/admin/users/[userId]`

## Capacidades

- Buscar por nombre, correo o telefono.
- Filtrar por rol, estado, pais y KYC.
- Ver ordenes recientes.
- Ver remesas recientes.
- Ver tickets.
- Ver audit logs.
- Cambiar estado de cuenta.
- Revisar KYC.
- Cambiar rol.

## Permisos

- `administrador`: puede revisar usuarios, estado y KYC.
- `superadmin`: puede cambiar roles.
- `administrador_economico`: no administra usuarios globales.
- `vendedor_vip`: no ve usuarios globales.
- `cliente`: solo su propio perfil.

## Protecciones

- Un administrador normal no puede modificar un superadmin.
- Un usuario no puede bloquearse a si mismo.
- Toda accion sensible debe quedar en `audit_logs`.
