# Estrategia de Dominio

## Decision principal

`msmmystore.com` sera la entrada principal del negocio y la marca publica sera **MSM MY STORE**.

No se comprara otro dominio ni se usara un nombre publico mas largo. El usuario final debe entrar directamente por:

```text
https://msmmystore.com
```

Desde ahi vera productos, servicios, compras, vendedores VIP, pagos, ordenes, entregas, confianza, soporte y terminos.

## Rol del concepto marketplace

**MSM Marketplace** puede seguir existiendo como modulo operativo interno del sistema: catalogo, tiendas VIP, productos, pagos, ordenes, ledger, auditoria y soporte.

No debe ser el nombre principal de la marca publica.

## Rutas canonicas

- `/`: inicio comercial MSM MY STORE.
- `/products`: productos y servicios.
- `/checkout`: compra y orden.
- `/orders`: seguimiento.
- `/dashboard/vip`: vendedor VIP.
- `/dashboard/admin`: administrador.
- `/dashboard/economic`: area economica.
- `/support`: soporte.
- `/terms`: terminos.
- `/how-it-works`: como funciona.

## Compatibilidad

Rutas antiguas o de beta:

- `/marketplace` redirige a `/`.
- `/marketplace/*` redirige a `/products`.
- `/dashboard/economico` redirige a `/dashboard/economic`.
- `/soporte` redirige a `/support`.
- `/terminos` redirige a `/terms`.
- `/como-funciona` redirige a `/how-it-works`.
- `/metodos-activos` redirige a `/payment-methods`.
- `/vendedores-verificados` redirige a `/verified-sellers`.

`marketplace.msmmystore.com` o `msmmystore.com/marketplace` pueden usarse solo para beta, pruebas o compatibilidad temporal.

## Sitio viejo

Si ya existe un sitio viejo en `msmmystore.com`, antes de reemplazarlo:

1. Exportar o descargar una copia completa del sitio actual.
2. Guardar DNS actuales y configuracion del hosting anterior.
3. Crear un backup de assets, imagenes, textos legales y formularios.
4. Probar MSM MY STORE en preview de Vercel.
5. Cambiar DNS solo cuando checkout, soporte, dashboards y beta esten verificados.
6. Mantener posibilidad de rollback durante la beta.

## Produccion

En Vercel, configurar `NEXT_PUBLIC_SITE_URL=https://msmmystore.com` y asociar el dominio `msmmystore.com` al proyecto principal. El modulo operativo interno puede seguir usando nombres de tablas, carpetas y documentacion tecnica relacionadas con marketplace.
