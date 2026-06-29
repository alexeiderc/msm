# Politica Legal Visible en Checkout

Texto resumido obligatorio en checkout:

> MSM actua como plataforma tecnologica, intermediario de pagos y organizador digital. Los productos, garantias, entregas y calidad son responsabilidad del vendedor independiente. Las demoras por clima, transporte, electricidad o disposiciones oficiales quedan como fuerza mayor. Las reclamaciones deben enviarse por escrito a commercial@msmmystore.com dentro de 30 dias.

La version completa esta publicada en `/terms` y `/terminos`.

## Reglas del producto

- El checkout debe mostrar el texto antes del boton de confirmacion.
- El checkout debe permitir consultar los terminos completos antes de aceptar.
- La aceptacion debe ser obligatoria.
- La aceptacion debe registrarse en `terms_acceptances` con version, usuario, orden, fecha e IP cuando este disponible.
- La orden debe guardar `legal_accepted_at`.
- Cambios al texto legal deben versionarse.

## Pendiente legal

Este texto es una base operativa para el MVP. Antes de produccion debe revisarlo un abogado familiarizado con comercio electronico, pagos internacionales, vendedores independientes y operaciones relacionadas con Cuba.
