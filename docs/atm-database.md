# Cajeros MSM - Base De Datos

La migracion `010_wallet_atm_exchange.sql` prepara:

- `wallet_accounts`
- `wallet_transactions`
- `atm_locations`
- `atm_machines`
- `atm_cash_inventory`
- `atm_reservations`
- `atm_qr_sessions`
- `atm_operations`
- `settings`

## Relaciones principales

- Un usuario puede tener varias billeteras por moneda.
- Una billetera tiene movimientos auditables.
- Un cajero tiene ubicacion y efectivo por moneda.
- Una reserva puede asignarse a cajero o tienda VIP.
- Una operacion puede generar ledger y evidencia.

## Produccion

Antes de produccion deben agregarse RLS, politicas por rol, buckets privados para evidencia y procesos de cierre economico.
