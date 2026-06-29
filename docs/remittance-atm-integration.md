# Integracion Remesas Y Cajeros MSM

Las remesas y Cajeros MSM comparten zona, liquidez, pagos, evidencia y ledger.

## Asignacion

Cuando una persona desea recibir efectivo:

1. El sistema revisa VIP activos en la zona.
2. Revisa liquidez disponible.
3. Revisa capacidad diaria.
4. Si existe Cajero MSM activo futuro, puede priorizarlo.
5. Si no, asigna VIP disponible.

## Regla MVP

En localhost el modulo es demo. En produccion debe consultar:

- `remittance_services`
- `remittance_liquidity`
- `zone_availability`
- `atm_cash_inventory`
- `atm_reservations`
- `payment_proofs`
- `ledger_entries`

## Auditoria

Toda entrega debe dejar:

- evento;
- evidencia;
- responsable;
- ubicacion;
- monto;
- moneda;
- estado;
- ledger.
