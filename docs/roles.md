# Roles

## cliente

Puede crear cuenta, completar KYC, aceptar terminos, consultar sus ordenes, facturas e incidencias. Para pagar compras o crear remesas debe tener KYC basico enviado y aceptar la politica contra contracargos o reclamaciones falsas.

## vendedor_vip

Puede gestionar su tienda, productos, precios, stock, imagenes, zonas, horarios, capacidad diaria, ordenes asignadas, evidencia de entrega y saldo acumulado.

## administrador

Puede aprobar vendedores, revisar KYC de vendedores y clientes, activar/suspender tiendas, revisar productos, ordenes, incidencias, reasignaciones, comisiones y audit logs.

## administrador_economico

Puede consultar ledger, ventas brutas, comisiones, saldos pendientes/pagados, cierres diarios/semanales, exportaciones CSV, registrar pagos con comprobantes internos y revisar riesgo economico del cliente antes de liberar entrega.

## superadmin

Acceso total operativo, economico y tecnico. Debe reservarse para cuentas internas con MFA.

## Recomendacion

Usar MFA para `administrador`, `administrador_economico` y `superadmin`. Toda accion sensible debe quedar en `audit_logs`.
