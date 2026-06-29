# Metodos de Pago Manuales

## Objetivo

MSM puede activar, pausar u ocultar metodos por pais, moneda y tipo de pago: Zelle, CashApp, Venmo, Bizum, IBAN, transferencia Mexico, Oxxo, USDT, PayPal, pago movil u otro.

## Reglas

- La pagina publica solo muestra pais, metodo y estado.
- Las cuentas exactas nunca se muestran en paginas publicas.
- La cuenta exacta se asigna dentro de una orden creada y queda enlazada a `orders.payment_account_id`.
- Cada metodo tiene minimo, maximo, comision, instrucciones visibles, instrucciones internas, prioridad, capacidad diaria y responsable economico.
- Cada cuenta tiene limite diario, monto recibido hoy, estado, vencimiento, nota interna y reglas de uso.

## Comprobantes

El cliente sube captura, referencia, monto, moneda, pais, metodo, fecha y nombre del remitente. La orden permanece en `pendiente_pago` hasta que economia apruebe. Si aprueba, la orden cambia a `pago_confirmado` y se escribe `order_events`.

## Antifraude basico

Genera `fraud_alerts` y `audit_logs` cuando:

- El monto no coincide.
- El comprobante esta repetido.
- El cliente tiene muchas ordenes pendientes.
- Una cuenta supera capacidad diaria.
- El metodo esta pausado.
- El pais no coincide.
- El comprador intenta pagar por una cuenta anterior o no asignada.
