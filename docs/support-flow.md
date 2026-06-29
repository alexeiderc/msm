# Soporte y Reclamaciones

## Motivos

Los tickets se abren por orden y pueden ser por demora, producto incorrecto, producto danado, falta de entrega, garantia u otro.

## Flujo

1. Cliente abre ticket enlazado a la orden.
2. Administrador asigna responsable.
3. Responsable pide evidencia al VIP o al cliente.
4. Se registra conversacion en `support_messages`.
5. Se resuelve con reparacion, reemplazo, credito interno, acuerdo entre partes o cierre documentado.

## Auditoria

La apertura, asignacion, cambios de estado y resolucion deben escribirse en `audit_logs`.
