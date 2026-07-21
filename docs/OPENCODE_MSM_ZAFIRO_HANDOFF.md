# OpenCode Handoff: MSM Marketplace + ZAFIRO

## Objetivo

Sincronizar el MVP de MSM MY STORE, validarlo, desplegarlo como `marketplace.msmmystore.com` e integrar enlaces claros con ZAFIRO sin mezclar las responsabilidades de ambos productos.

## Arquitectura de dominios

- `https://marketplace.msmmystore.com`: comercio, productos, remesas, Saldo MSM, ordenes, pagos, entregas y paneles.
- `https://zafiro.msmmystore.com`: comunidad, conocimiento, reputacion, patrocinadores y perfiles del ecosistema.
- `https://eliana.msmmystore.com`: incubadora ELIANA independiente. Solo se activa con sus secretos y Supabase configurados.

## Cambios que deben conservarse

- Modulo `La Maquina del Futuro`, sus rutas, componentes, API y migracion `015_maquina_del_futuro.sql`.
- Puente de ELIANA desde `/eliana` hacia `eliana.msmmystore.com`.
- Barra de patrocinio ZAFIRO y la ruta `/zafiro` dentro de Marketplace.
- El modulo publico de inversionistas usa un token opaco del lado del servidor. No crear una politica RLS publica que permita leer todas las salas.

## Validacion obligatoria

1. Ejecutar `npm run build` en la raiz del proyecto.
2. Verificar que `.env.local` nunca se agregue a Git.
3. Aplicar en Supabase las migraciones que falten, incluida `015_maquina_del_futuro.sql`.
4. Revisar que RLS se conserve activado para las tablas de La Maquina del Futuro.
5. Probar cliente, VIP, administrador y economico antes de publicar.

## Publicacion GitHub y Vercel

1. Trabajar desde una rama nueva, por ejemplo `agent/msm-zafiro-production`.
2. Agregar solo archivos de aplicacion, migraciones, documentacion y configuracion. Excluir `.env.local`, claves, logs, `node_modules`, `.next` y archivos de compilacion.
3. Hacer commit despues de un build exitoso.
4. Subir la rama a `https://github.com/MSM2024/msm` y abrir un PR de borrador hacia `main`.
5. En Vercel, conectar el proyecto a esa rama, usar `pnpm install` y `pnpm build`, configurar las variables de produccion y hacer el deploy.
6. Asociar `marketplace.msmmystore.com` al proyecto Marketplace. No redirigirlo al dominio raiz.

## Integracion requerida en ZAFIRO

En el repositorio de ZAFIRO, agregar una entrada visible de navegacion y/o una tarjeta de patrocinador hacia:

```text
https://marketplace.msmmystore.com
```

Etiqueta sugerida: `MSM Marketplace`.

Mantener tambien el enlace de vuelta desde Marketplace hacia:

```text
https://zafiro.msmmystore.com/sponsors-page
```

Cuando `eliana.msmmystore.com` este desplegado, insertar el widget sin copiar claves al frontend:

```html
<script src="https://eliana.msmmystore.com/widget.js" defer></script>
```

## Criterio de terminado

- El build pasa sin errores.
- La aplicacion abre desde `marketplace.msmmystore.com`.
- ZAFIRO tiene un enlace funcional hacia Marketplace y Marketplace tiene enlace funcional hacia ZAFIRO.
- No hay secretos en el repositorio.
- Los paneles y rutas protegidas requieren sesion real de Supabase en produccion.
