# Perfiles VIP

MSM MY STORE usa `stores` como perfil publico y operativo de cada vendedor VIP.

## Tipos

- `vendedor_independiente`: tienda o socio local verificado.
- `tienda_oficial`: tienda oficial MSM MY STORE LLC o una tienda principal autorizada.

## Perfil publico

Cada perfil debe tener:

- Nombre comercial.
- Propietario.
- Compania, si aplica.
- Telefono, WhatsApp y correo.
- Provincia y municipio.
- Zonas de entrega.
- Categorias.
- Servicios activos.
- Garantia.
- Estado.
- Nivel/reputacion.

## Perfil oficial demo

El seed crea:

- Nombre comercial: MSM MY STORE.
- Propietario: Miguel Soria Martinez.
- Compania: MSM MY STORE LLC.
- Tipo: `tienda_oficial`.
- Nivel: `super_vip`.
- Provincia: Santiago de Cuba.
- Municipio: Segundo Frente.
- Zona: Mayari Arriba y Segundo Frente.

## Ruta publica

Cada perfil activo tiene pagina:

```text
/vendedores/[slug]
```

Ejemplo:

```text
/vendedores/msm-my-store-oficial-segundo-frente
```

## Panel VIP

El vendedor ve `Mi perfil VIP` en `/dashboard/vip`, con tienda, nivel, municipio, servicios, remesas y zonas.
