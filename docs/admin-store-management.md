# Administracion de Tiendas VIP

El administrador puede crear perfiles VIP manualmente desde `/dashboard/admin`.

## Casos

- Crear vendedor de confianza sin registro previo.
- Crear tienda local por provincia o municipio.
- Crear tienda oficial MSM MY STORE.
- Activar, pausar o suspender un perfil.
- Destacar tienda.
- Asignar categorias y zonas.
- Activar remesas por municipio.

## Formularios

En `/dashboard/admin`:

- `Crear perfil VIP / tienda`.
- `Crear producto por tienda`.
- `Aprobar vendedor por ID`.
- `Cambiar comision VIP`.
- `Revisar solicitud VIP`.
- `Reasignar orden por SLA`.

## Regla de publicacion

Un producto no aparece al cliente si falta:

- Tienda activa.
- Vendedor enlazado.
- Provincia.
- Municipio.
- Producto en estado `activo`.
- `is_active=true`.

Si falta algo, se guarda como borrador operativo.

## Auditoria

Las acciones administrativas escriben en `audit_logs`:

- `vip_store.manual_create`.
- `admin.product_create`.
- `seller.approve`.
- `seller.commission_update`.
- `order.reassign`.
