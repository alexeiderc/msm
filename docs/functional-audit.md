# Auditoria funcional MSM MY STORE

Fecha: 2026-06-20

## Funciona con base de datos real

- Login con Supabase Auth desde `/auth/login`.
- Checkout en `/checkout`: valida con Zod, crea `orders`, `order_items`, `order_events`, `terms_acceptances`, asigna cuenta rotativa disponible y descuenta stock.
- Comprobante en `/ordenes/[orderId]/comprobante`: guarda `payment_proofs` y genera alertas antifraude por monto, pais, cuenta o referencia repetida.
- Revision economica en `/dashboard/economic`: aprueba/rechaza comprobantes, cambia orden a `pago_confirmado`, crea `payments`, `order_events` y `ledger_entries`.
- Metodos y cuentas de pago en `/dashboard/economic`: crean `payment_methods` y `payment_accounts` con estado, limites, prioridad e instrucciones.
- Payout en `/dashboard/economic`: crea `payouts`, inserta movimiento `payout` en `ledger_entries` y registra auditoria.
- Panel VIP en `/dashboard/vip`: crea producto, actualiza stock, cambia estados de orden y sube evidencia de entrega en `delivery_evidence`.
- Acuerdo digital VIP: guarda `seller_agreements` con version y usuario.
- Solicitud VIP en `/vendedores/solicitud`: guarda `seller_applications`.
- Admin en `/dashboard/admin`: aprueba vendedores, revisa solicitudes VIP, cambia comisiones, reasigna ordenes por SLA y registra `audit_logs`.
- Soporte en `/support`: abre `support_tickets`, guarda `support_messages` y audita la accion.
- Seguimiento en `/orders`: lee ordenes reales del cliente autenticado.
- KYC cliente en `/account/kyc`: actualiza `profiles` y registra auditoria.
- Reputacion VIP en `/reviews/new`: guarda calificaciones en `reviews` por cumplimiento, calidad y atencion.
- Terminos en `/terms`: publica las politicas operativas del documento oficial y mantiene aceptacion obligatoria en checkout.
- Productos en `/products`: intenta leer productos activos reales, permite buscar y filtrar por provincia/categoria; usa demo solo si no hay Supabase/datos.
- Checkout en `/checkout?product=ID`: muestra resumen del producto real seleccionado cuando existe en Supabase.
- Panel Don Miguel en `/dashboard/don-miguel`: calcula metricas desde ordenes, comprobantes, vendedores, cuentas, tickets, items y ledger.
- Exportacion CSV: `/api/ledger/export` descarga movimientos de `ledger_entries`.
- PWA: manifest, icono y service worker preparado; se registra en produccion o con `NEXT_PUBLIC_PWA_ENABLED=true`.

## Sigue demostrativo o parcial

- Cajeros MSM Digital `/atm`: pantalla funcional demo con reserva local, QR temporal simulado y datos demo. Tablas y modelos quedan preparados para Supabase.
- Billetera `/wallet`: dashboard demo de saldos y movimientos. Falta conectar a `wallet_accounts` y `wallet_transactions`.
- Cambio `/exchange`: cotizador demo seguro sin tasas publicas. Falta conectar a revision economica y orden real.
- Carrito `/cart` queda como entrada operativa al flujo MVP: elegir producto o crear orden directa. El carrito persistente multiproducto queda para fase avanzada.
- Home `/` usa contenido comercial y productos destacados demo.
- Subida de archivos es por URL; falta integrar Supabase Storage con upload directo.
- Reasignacion manual por SLA ya funciona en admin; falta automatizar el job que detecte vencimientos sin intervencion humana.
- Notificaciones tienen plantillas y modulo base, pero falta disparo automatico por evento.
- WhatsApp queda preparado como modulo futuro, sin proveedor conectado.
- Factura digital existe como datos de orden; falta generar PDF fiscal/formal.
- Reservas de inventario se aplican al crear orden con descuento de stock; falta reserva temporal con expiracion si el comprador no paga.

## Requisitos para probar operacion real

- Supabase real o Supabase local con migraciones aplicadas.
- `.env.local` con URL, anon key, service role y `DATABASE_URL`.
- Usuarios creados en Supabase Auth y perfiles en `profiles` con roles correctos.
- Seed ejecutado para categorias, provincias, municipios, vendedor demo, tienda demo, producto demo, metodos y cuenta Zelle.

## Flujo funcional recomendado

1. Entrar como cliente y crear orden en `/checkout`.
2. Copiar el ID real de la orden desde Supabase o `/orders`.
3. Subir comprobante en `/ordenes/[orderId]/comprobante`.
4. Entrar como `administrador_economico` y aprobar el comprobante en `/dashboard/economic`.
5. Entrar como `vendedor_vip`, cambiar estado y subir evidencia en `/dashboard/vip`.
6. Revisar ledger y payout en `/dashboard/economic`.
7. Reasignar una orden por SLA desde `/dashboard/admin` si el VIP no confirma.
8. Calificar al vendedor en `/reviews/new?sellerId=ID_DEL_VENDEDOR&orderId=ID_DE_LA_ORDEN`.
9. Revisar metricas en `/dashboard/don-miguel`.
