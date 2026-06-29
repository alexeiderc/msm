# Remesas por Zona

Las remesas usan el mismo concepto territorial que productos y servicios.

## Perfil VIP de remesas

Una tienda VIP puede activar:

- `remittances_active`.
- Metodos de entrega: efectivo, transferencia, pickup, domicilio.
- Municipios atendidos.
- Efectivo disponible.
- Limite diario.
- Tiempo estimado.
- Forma de evidencia.

## Creacion de remesa

El cliente completa en `/remittances`:

- Pais desde donde paga.
- Metodo de pago.
- Monto.
- Moneda.
- Provincia del receptor.
- Municipio del receptor.
- Nombre, telefono, direccion y referencias.
- Forma de entrega.

## Asignacion VIP

Al crear la remesa, el sistema busca una tienda activa con:

- `remittances_active=true`.
- Estado `activo`.
- `is_active=true`.
- Municipio dentro de `remittance_municipalities`.

Si encuentra coincidencia, guarda:

- `assigned_seller_id`.
- `vip_store_id`.

El evento inicial en `remittance_events` incluye el VIP asignado.

## Comprobante y economia

Luego el cliente sube comprobante en:

```text
/remittances/[remittanceId]/proof
```

Economia revisa en:

```text
/dashboard/economic
```

Al aprobar, la remesa pasa a `pago_recibido`.
