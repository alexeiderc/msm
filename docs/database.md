# Base de Datos

## Tablas principales

- `profiles`: perfil, rol, KYC cliente, titular de pago, riesgo, aceptacion antifraude y metodo validado.
- `customer_kyc_reviews`: historial de revisiones KYC del cliente por MSM o app externa.
- `sellers`, `seller_kyc`: vendedor VIP, estado, nivel, comision, capacidad y verificacion.
- `stores`, `products`, `categories`, `product_images`: catalogo publico.
- `stores` funciona como perfil publico/operativo del VIP o tienda oficial, con tipo, estado, provincia, municipio, zonas, servicios, remesas y reputacion.
- `products` incluye provincia, municipio, zona, moneda, garantia, disponibilidad, SLA, estado y notas internas.
- `provinces`, `municipalities`: cobertura territorial.
- `orders`, `order_items`, `order_events`, `delivery_evidence`: operacion de pedidos, riesgo del cliente, bloqueo de entrega, OTP y evidencia.
- `payments`, `ledger_entries`, `payouts`, `commissions`: finanzas.
- `payment_methods`, `payment_accounts`, `payment_proofs`, `payment_reviews`: pagos manuales por pais, cuentas rotativas, comprobantes y revision economica.
- `seller_applications`, `seller_agreements`: onboarding y acuerdo digital vendedor VIP.
- `support_tickets`, `support_messages`: soporte y reclamaciones por orden.
- `notification_templates`: plantillas editables para correo y WhatsApp futuro.
- `beta_access`: control de beta privada.
- `fraud_alerts`: alertas antifraude auditables.
- `executive_reports`: snapshots de reportes ejecutivos.
- `reviews`, `disputes`, `notifications`: reputacion, reclamos y mensajes.
- `audit_logs`, `terms_acceptances`: trazabilidad legal y administrativa.

## Estados nuevos

Tienda:

- `activo`
- `pausado`
- `suspendido`

Tipo de tienda:

- `vendedor_independiente`
- `tienda_oficial`

Producto:

- `borrador`
- `activo`
- `pausado`
- `agotado`

Niveles VIP:

- `vendedor_nuevo`
- `vendedor_verificado`
- `vendedor_destacado`
- `vendedor_vip`
- `super_vip`
- `tienda_oficial`

## Estados de orden

`pendiente_pago`, `pago_confirmado`, `asignada_vip`, `confirmada_vip`, `preparando`, `en_ruta`, `entregada`, `cerrada`, `incidencia`, `cancelada`.

## Ledger economico

Cada orden cerrada debe generar entradas:

- Venta bruta.
- Comision MSM.
- Comision pasarela.
- Neto vendedor.
- Ajustes manuales si aplica.
- Payout cuando se pague por Zelle o transferencia.

## RLS

La migracion inicial habilita RLS en tablas sensibles. Las politicas base cubren:

- Catalogo publico activo.
- Productos publicos solo cuando tienda y producto estan activos y tienen provincia/municipio.
- Perfil propio.
- Vendedor propio.
- Ordenes del cliente, vendedor asignado o admins.
- Ledger visible para economico, superadmin y vendedor propietario.
- Logs visibles solo para administracion.
- Cuentas de pago visibles solo para economico/superadmin; la cuenta exacta se enlaza a una orden, no se publica.
- Comprobantes visibles para el cliente propietario y economia.
- Tickets visibles para cliente, asignado y administracion.

Antes de produccion, agregar politicas de escritura por rol para cada flujo final conectado.
