# Arquitectura

## Principios

- Mobile first: las rutas principales funcionan en pantalla pequena antes de crecer a layouts de escritorio.
- Seguridad por rol: middleware protege paneles y RLS limita acceso directo a datos.
- Auditoria por defecto: cambios sensibles deben escribir `audit_logs` y `order_events`.
- Separacion limpia: UI en `components`, acceso externo en `lib`, mutaciones en `server/actions`, modelo en `prisma` y SQL en `src/database/migrations`.

## Carpetas

- `src/app`: rutas Next.js.
- `src/components`: componentes UI, marketplace y dashboard.
- `src/lib`: Supabase, Prisma, email, WhatsApp, utilidades y validaciones.
- `src/server/actions`: acciones servidor para checkout, administracion y economia.
- `src/database`: migraciones SQL Supabase.
- `src/types`: tipos de dominio compartidos.
- `docs`: documentacion del producto y operacion.

## Integraciones

- Supabase Auth crea usuarios. `profiles.id` referencia `auth.users.id`.
- Supabase Storage debe tener buckets separados para `product-images`, `kyc-documents` y `delivery-evidence`.
- Para pagos manuales, `payment_methods` es publico solo como resumen; `payment_accounts` es server-only/economia.
- Las acciones que asignan cuentas, revisan comprobantes o escriben alertas usan cliente administrativo server-only para respetar RLS sin exponer cuentas.
- Prisma se usa para desarrollo local, seed y tipado de modelo.
- Resend envia recibos y alertas.
- `src/lib/whatsapp.ts` deja lista una salida futura para proveedor WhatsApp.

## Auditoria

Cada transicion de orden debe escribir en `order_events`. Cada accion administrativa sensible debe escribir en `audit_logs`, incluyendo aprobacion KYC, suspension de tienda, cambio de comision, reasignacion de orden, cierre de disputa, registro de payout, revision de comprobantes y alertas antifraude.
