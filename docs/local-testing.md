# Prueba Local

## Arranque

```bash
pnpm install
pnpm db:generate
pnpm dev
```

URL local:

```text
http://localhost:3000
```

Si `localhost:3000` no abre o aparece error 500 despues de una prueba, cierra la ventana del servidor con `Ctrl + C` y abre `reset-local.cmd`. Ese script limpia `.next` y arranca de nuevo.

Con `BETA_MODE=true`, `/`, `/products` y `/marketplace` redirigen a `/beta` salvo que uses una cookie interna `msm_beta_preview`. Para una prueba visual rapida, pon `BETA_MODE=false` en `.env.local` y reinicia `pnpm dev`.

## Rutas

- `http://localhost:3000/`
- `http://localhost:3000/products`
- `http://localhost:3000/vendedores-verificados`
- `http://localhost:3000/vendedores/msm-my-store-oficial-segundo-frente`
- `http://localhost:3000/remittances`
- `http://localhost:3000/exchange`
- `http://localhost:3000/wallet`
- `http://localhost:3000/atm`
- `http://localhost:3000/remittances/REMESA_ID/proof`
- `http://localhost:3000/cart`
- `http://localhost:3000/checkout`
- `http://localhost:3000/orders`
- `http://localhost:3000/auth/login`
- `http://localhost:3000/auth/signup`
- `http://localhost:3000/auth/forgot-password`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/ordenes/ORDER_ID/comprobante`
- `http://localhost:3000/dashboard/economic`
- `http://localhost:3000/dashboard/vip`
- `http://localhost:3000/dashboard/admin`
- `http://localhost:3000/dashboard/don-miguel`
- `http://localhost:3000/payment-methods`
- `http://localhost:3000/vendedores/solicitud`
- `http://localhost:3000/support`

## Flujo esperado

1. Cliente entra a MSM MY STORE en `/`.
2. Busca en `/products` por provincia, municipio, categoria, producto, servicio o vendedor VIP.
3. Revisa el perfil publico en `/vendedores/[slug]`.
4. Entra con Supabase Auth desde `/auth/login`.
5. Completa `/checkout` con receptor en Cuba, metodo de pago y aceptacion legal.
6. La orden queda en `pendiente_pago` y aparece en `/orders`.
7. Cliente sube comprobante en `/ordenes/[orderId]/comprobante`.
8. Economia revisa y aprueba desde `/dashboard/economic`.
9. La orden cambia a `pago_confirmado` y se registran `payments`, `order_events` y `ledger_entries`.
10. VIP confirma, prepara, marca en ruta y entrega con evidencia desde `/dashboard/vip`.
11. Economia registra payout y exporta CSV desde `/dashboard/economic`.
12. Don Miguel revisa metricas en `/dashboard/don-miguel`.
13. Prueba `/wallet`, `/exchange` y `/atm` como demo de segunda fase financiera.
14. En `/atm` genera una reserva demo y revisa el QR temporal.

## Comandos verificados

```bash
pnpm --config.verifyDepsBeforeRun=false typecheck
pnpm --config.verifyDepsBeforeRun=false lint
pnpm --config.verifyDepsBeforeRun=false build
pnpm --config.verifyDepsBeforeRun=false dev
```

Los modulos funcionales y pendientes estan listados en `docs/functional-audit.md`.
