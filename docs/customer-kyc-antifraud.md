# KYC cliente y antifraude

MSM my store requiere que el cliente cree cuenta y complete KYC antes de pagar compras o crear remesas.

## Objetivo

- Vincular cliente, telefono, pais, documento y titular del pago.
- Reducir pagos desconocidos, reclamos falsos, contracargos indebidos y abuso despues de la entrega.
- Dar al area economica senales de riesgo antes de aprobar comprobantes.
- Proteger a MSM, al comprador honesto y al vendedor VIP.

## Flujo cliente

1. Cliente crea cuenta en `/auth/signup`.
2. Completa KYC en `/account/kyc`.
3. Declara nombre legal, telefono, pais, direccion, tipo de documento, ultimos caracteres del documento, app/metodo de pago y nombre del titular del pago.
4. Acepta politica contra reclamos falsos, datos falsos y contracargos indebidos.
5. El sistema guarda `customer_kyc_status`, `customer_risk_level` y auditoria.
6. Si el titular del pago no coincide con el cliente, se registra alerta en `fraud_alerts`.
7. Checkout y remesas bloquean operaciones si falta KYC basico.

## Estados recomendados

- `pendiente`: cuenta creada sin KYC completo.
- `requiere_revision`: KYC enviado, pendiente de revision MSM o app externa.
- `aprobado`: cliente revisado y aceptado.
- `rechazado`: cliente bloqueado para nuevas operaciones hasta decision administrativa.

## App externa de KYC

El proyecto queda preparado para conectar una app externa usando:

```bash
KYC_CUSTOMER_PROVIDER=manual_msm
KYC_CUSTOMER_APP_URL=
KYC_CUSTOMER_WEBHOOK_SECRET=
```

En localhost, si `KYC_CUSTOMER_APP_URL` esta vacio, el proceso queda en modo manual MSM.

## Regla contra contracargos

La aceptacion KYC deja constancia de que una reclamacion falsa, contracargo indebido, desconocimiento malicioso del pago o datos falsos puede causar bloqueo de cuenta, investigacion, cancelacion de ordenes y registro antifraude.

Esto no elimina el derecho del cliente a reclamar por escrito cuando exista un problema real. Las reclamaciones reales deben pasar por soporte y evidencia.
