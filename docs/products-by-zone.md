# Productos por Zona

El catalogo publico de `/products` muestra productos conectados a tienda VIP, provincia y municipio.

## Campos clave

Producto:

- Imagen principal.
- Galeria.
- Nombre.
- Descripcion.
- Precio y moneda.
- Categoria y subcategoria.
- Provincia.
- Municipio.
- Zona de entrega.
- Vendedor responsable.
- Stock.
- Disponibilidad.
- Garantia.
- Tiempo prometido: `h24`, `h48`, `h72` o `bajo_gestion`.
- Estado: `borrador`, `activo`, `pausado`, `agotado`.
- Destacado.
- Notas internas.

Tienda:

- Nombre comercial.
- Tipo.
- Provincia.
- Municipio.
- Zonas.
- Estado.

## Visibilidad publica

Solo se publica cuando:

- `products.is_active=true`.
- `products.status='activo'`.
- `stores.is_active=true`.
- `stores.status='activo'`.
- Hay provincia y municipio.
- El producto pertenece a una tienda real.

## Demo local

El seed crea productos oficiales en Segundo Frente, Santiago de Cuba:

- Freidora de aire EKO.
- Batidora Fagor.
- Lavadora semidoble EKO.
- Cocina infrarroja EKO2202.
- Nevera 3.5 pies.
- Freezer 7 pies.
- Olla reina EKO.
- Combo alimentos MSM.
- Kit solar basico MSM.
- Servicio de remesa efectivo Segundo Frente.

Las imagenes locales quedan en:

```text
public/products
```
