# Flujo De Remesas

1. Cliente crea cuenta.
2. Completa KYC.
3. Entra a `/remittances`.
4. Selecciona pais, metodo, monto, moneda y receptor.
5. Sistema asigna cuenta disponible.
6. Orden queda `pendiente_pago`.
7. Cliente sube comprobante.
8. Economia revisa.
9. Si aprueba, cambia a pago confirmado.
10. Sistema asigna VIP por zona.
11. VIP confirma disponibilidad.
12. VIP entrega efectivo, transferencia, pickup o domicilio.
13. VIP sube evidencia.
14. Ledger registra comision y saldo.
15. Economia cierra payout.
