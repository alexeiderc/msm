# Auditoria contra documento oficial

Fuente revisada: `MSM MARKETPLACE CUBA .docx`

Fecha: 2026-06-20

## Decisiones aplicadas

- La marca publica queda como `MSM MY STORE` sobre `msmmystore.com`.
- `MSM Marketplace` queda como modulo operativo interno, aunque el documento original menciona `/marketplace`.
- Se mantiene `/marketplace` solo para compatibilidad y beta.

## Requisitos del documento cubiertos

- Compra para diaspora con receptor en Cuba, direccion, referencias, telefono y horario.
- Pago controlado por MSM, comprobante, revision economica y activacion de entrega.
- Vendedor VIP con productos, stock, SLA, ordenes, estados y evidencia de entrega.
- Ledger por vendedor con venta bruta, comision MSM, comision pasarela, neto y payout.
- Roles `cliente`, `vendedor_vip`, `administrador`, `administrador_economico`, `superadmin`.
- KYC vendedor, solicitud VIP, acuerdo digital y verificacion comunitaria.
- KYC cliente con telefono, direccion y metodo de pago validado.
- Reputacion por cumplimiento, calidad y atencion.
- Soporte por orden, reclamos, evidencias y resolucion documentada.
- Terminos de plataforma, responsabilidad del vendedor, fuerza mayor y reclamaciones a `commercial@msmmystore.com`.
- Panel ejecutivo para Don Miguel con metricas operativas.

## Conectado como funcion real

- `/checkout`
- `/orders`
- `/ordenes/[orderId]/comprobante`
- `/dashboard/economic`
- `/dashboard/vip`
- `/dashboard/admin`
- `/dashboard/don-miguel`
- `/support`
- `/vendedores/solicitud`
- `/account/kyc`
- `/reviews/new`
- `/terms`

## Pendiente antes de produccion

- Subida directa a Supabase Storage para fotos, KYC y evidencias.
- Generacion final de factura PDF.
- Job automatico para vencimiento de SLA y reasignacion sin operador.
- Notificaciones automaticas conectadas a Resend y futuro WhatsApp.
- Reserva temporal de stock con expiracion cuando el comprador no completa pago.
- Revision legal final en Cuba/Estados Unidos antes del lanzamiento publico.
