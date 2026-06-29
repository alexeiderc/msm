# Expansion global MSM my store

MSM my store debe operar como plataforma multi-pais. Cuba sigue siendo el mercado principal inicial, pero el sistema debe permitir que vendedores VIP se unan desde Estados Unidos y otros paises para publicar productos, servicios, entregas locales, pickup, remesas o gestiones por zona.

## Estado actual

- Cuba esta cargada con todas sus provincias y municipios.
- Se agrego estructura multi-pais para catalogo publico.
- Estados Unidos esta preparado por estado y ciudades principales.
- El catalogo puede filtrar por pais, estado/provincia, ciudad/municipio, categoria y busqueda.
- El formulario VIP y el panel admin ya pueden seleccionar pais, estado/provincia y ciudad/municipio.
- Productos demo muestran VIPs en Miami, Houston y New York.
- La migracion `007_global_market_expansion.sql` agrega `country` en `stores`, `products` y `seller_applications`.

## Modelo geografico

- `country`: pais operativo, ejemplo `Cuba` o `Estados Unidos`.
- `province`: provincia, estado o region.
- `municipality`: municipio, ciudad o localidad.
- `deliveryZone`: zona especifica de entrega, pickup o cobertura.

## Flujo para un VIP en Estados Unidos

1. El VIP solicita entrada en `/vendedores/solicitud`.
2. Selecciona `Estados Unidos`, estado y ciudad.
3. Agrega categorias, productos, servicios, zona, horario y garantia.
4. Admin revisa KYC y aprueba.
5. Admin o VIP publica productos con pais, estado y ciudad.
6. Cliente filtra por pais, estado, ciudad o producto en `/products`.
7. Compra, paga por metodo MSM, y el VIP entrega o coordina pickup local.

## Faltante para produccion global robusta

- Ejecutar migracion `007_global_market_expansion.sql` en Supabase produccion.
- Agregar politicas RLS por pais/zona si se separan operaciones por equipos.
- Crear tabla formal `countries`, `regions`, `cities` si el volumen crece mas alla de datos estaticos.
- Crear onboarding especifico para VIP de Estados Unidos con impuestos, condiciones locales y evidencia.
- Crear reglas de entrega local, pickup y envio por ciudad.
- Separar catalogos por mercado si se necesitan precios, monedas o comisiones distintas.
- Agregar reportes por pais, estado, ciudad, VIP y categoria.
- Revisar terminos legales para operaciones fuera de Cuba.
