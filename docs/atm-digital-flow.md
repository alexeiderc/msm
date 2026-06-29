# Cajeros MSM Digital - Flujo

## Reserva de efectivo

1. Cliente entra a `/atm`.
2. Selecciona provincia, municipio, moneda, monto y metodo de pago.
3. El sistema crea reserva `pendiente_pago`.
4. Cliente paga dentro de una orden/reserva MSM.
5. Area economica revisa comprobante.
6. Al aprobar cambia a `pago_confirmado`.
7. Sistema asigna VIP o Cajero MSM disponible.
8. Reserva cambia a `reservado` y luego `listo_para_retirar`.
9. Cliente usa QR temporal.
10. VIP o Cajero entrega efectivo.
11. Operacion queda `entregado`.
12. Ledger, evidencia y audit logs quedan registrados.

## Estados

- `pendiente_pago`
- `pago_confirmado`
- `reservado`
- `listo_para_retirar`
- `entregado`
- `expirado`
- `cancelado`

## Seguridad

El QR debe vencer. Nunca debe reutilizarse. Cada uso debe quedar enlazado al cliente, reserva, zona, responsable y ledger.
