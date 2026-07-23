# Rendimiento para Cuba

MSM my store debe ser usable con internet lento, datos moviles caros y conexiones inestables.

## Reglas de producto

- Mantener la primera pantalla ligera.
- Evitar videos automaticos, fondos pesados y animaciones innecesarias.
- Usar imagenes comprimidas y proporciones estables.
- No cargar datos sensibles o paneles complejos en paginas publicas.
- Priorizar texto claro y botones directos sobre decoracion.

## Modo ligero

La app incluye un boton `Modo ligero`.

El modo tambien puede activarse automaticamente si el navegador detecta ahorro de datos o conexion 2G.

Cuando esta activo:

- Se elimina el fondo pesado del hero.
- Se reducen sombras, blur y animaciones.
- La interfaz conserva navegacion, compra, remesas, ordenes y soporte.

## Imagenes

Next.js queda configurado para servir AVIF/WebP, cachear imagenes y usar tamanos responsivos.

Recomendaciones para nuevos productos:

- Imagen principal: ideal menor de 120 KB.
- Galeria: maximo 4 imagenes por producto en MVP.
- Evitar capturas de WhatsApp con texto grande si pueden recortarse.
- Subir fotos en JPG/WebP optimizado.
- Para VIP en Cuba, permitir subir una sola foto principal primero y galeria despues.

## Caching

`/brand/*` y `/products/*` se cachean por largo plazo para que el cliente no vuelva a descargarlos en cada visita.

Si una imagen cambia pero mantiene el mismo nombre, puede quedarse cacheada. Para reemplazos importantes, usar un nombre nuevo.

## Proximos pasos

- Generar miniaturas automaticas en Supabase Storage.
- Cargar mas productos con paginacion o boton "ver mas".
- Agregar una vista de catalogo "solo texto" para conexiones extremas.
- Medir peso por ruta antes de beta publica.
