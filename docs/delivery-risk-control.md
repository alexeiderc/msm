# Riesgo, bloqueo de entrega y OTP

Este modulo protege a MSM my store antes y despues del pago.

## Riesgo del cliente

Al crear una orden, el sistema calcula `customer_risk_score` y `customer_risk_level` usando:

- Estado KYC del cliente.
- Metodo de pago validado por MSM.
- Aceptacion antifraude/contracargos.
- Titular de pago coincide o no con el cliente.
- Ordenes pendientes.
- Alertas antifraude previas.

La orden guarda una foto del riesgo en:

- `orders.customer_risk_score`
- `orders.customer_risk_level`
- `orders.customer_risk_reasons`

## Bloqueo de entrega VIP

Mientras la orden esta en `pendiente_pago`, el VIP no debe operar entrega ni ver datos sensibles completos del receptor en el panel.

Cuando Economia aprueba el comprobante:

1. La orden cambia a `pago_confirmado`.
2. Se marca `vip_delivery_unlocked_at`.
3. Se genera OTP de entrega.
4. Se registra evento en `order_events`.
5. En produccion, ese OTP debe enviarse por canal seguro al cliente o receptor.

## Evidencia fuerte

Para cerrar una orden como `entregada`, el VIP debe registrar evidencia:

- Foto.
- Firma o comprobante.
- Nombre de quien recibe.
- Ultimos digitos de documento del receptor si aplica.
- OTP correcto cuando fue generado.
- Mensaje de entrega.

La tabla `delivery_evidence` guarda `otp_verified` y `evidence_quality_score`.

## Reglas importantes

- El VIP no puede marcar entregada desde el cambio simple de estado.
- La entrega se cierra desde el formulario de evidencia.
- Si el cliente esta `bloqueado`, solo administracion puede decidir.
- Economia no debe aprobar una orden con cliente bloqueado.

## Nota local

En desarrollo local, el OTP se guarda en `order_events.metadata.deliveryOtpDemo` para poder probar el flujo. En produccion, debe enviarse por notificacion segura y no mostrarse en paneles publicos.
