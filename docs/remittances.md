# Remesas MSM

El modulo de remesas permite crear solicitudes financieras separadas de compras de productos.

## Flujo MVP

1. Cliente entra a `/remittances`.
2. Completa datos de quien envia, receptor en Cuba, pais, moneda, monto, metodo de pago MSM y forma de entrega.
3. MSM asigna una cuenta activa del metodo seleccionado.
4. La remesa queda en `pendiente_pago`.
5. El cliente sube comprobante en `/remittances/[remittanceId]/proof`.
6. Economia revisa pago, riesgo, cuenta asignada y disponibilidad operativa desde `/dashboard/economic`.
7. Si aprueba el comprobante, la remesa cambia a `pago_recibido`.
8. La remesa avanza por estados hasta entrega o cierre documentado.

## Tablas

- `remittances`
- `remittance_events`
- `remittance_payment_proofs`
- `remittance_payment_reviews`
- `payment_methods`
- `payment_accounts`
- `fraud_alerts`
- `audit_logs`

## Comprobantes de remesas

El comprobante guarda:

- Imagen o URL de captura.
- Referencia.
- Monto.
- Moneda.
- Pais.
- Metodo y cuenta asignada.
- Nombre de quien envio.
- Fecha del pago.

El revisor economico puede:

- Aprobar.
- Rechazar.
- Pedir nueva evidencia.

Al aprobar, el sistema:

- Actualiza la remesa a `pago_recibido`.
- Registra evento en `remittance_events`.
- Aumenta `received_today` en la cuenta asignada.
- Crea log en `audit_logs`.

## Storage

Para subir archivos reales, crea en Supabase Storage un bucket llamado `payment-proofs`.
Si el bucket no esta listo, el formulario tambien acepta una URL de imagen para pruebas locales.

## Antifraude basico

El sistema crea alertas y logs cuando detecta:

- Monto distinto al solicitado.
- Pais o moneda distintos.
- Metodo no asignado.
- Cuenta diferente a la asignada.
- Comprobante repetido por referencia, monto y moneda.

## Metodos COMPRO

La lista enviada por MSM se guarda como metodos activos con:

- Metodo/pais/moneda.
- Estado activo/pausado/oculto.
- Cuenta rotativa asignable solo dentro de una remesa creada.

No se muestran tarifas publicas en `/remittances`. La pagina publica muestra pais, moneda y metodo disponible. Las cuentas exactas de pago siguen ocultas y solo se entregan dentro de una remesa creada.

## Metodos a recibir

- USD efectivo.
- CUP efectivo.
- CUP transferencia.
- MLC clasica.
- MLC tropical.

## Estados

- `pendiente_pago`
- `pago_recibido`
- `en_revision`
- `lista_para_entrega`
- `entregada`
- `cerrada`
- `incidencia`
- `cancelada`

## Prueba local

1. Entra a `/remittances`.
2. Crea la remesa.
3. Usa el boton "Subir comprobante ahora".
4. Entra a `/dashboard/economic`.
5. Copia el ID del comprobante y el ID de la remesa.
6. Usa "Revisar comprobante remesa" y aprueba.
