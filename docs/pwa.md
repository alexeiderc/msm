# PWA MSM MY STORE

La app queda preparada como Progressive Web App.

## Archivos

- `public/manifest.webmanifest`
- `public/icons/msm-icon.svg`
- `public/sw.js`
- `src/components/pwa/pwa-register.tsx`

## Activacion

En local queda desactivado por defecto para evitar cache vieja durante pruebas.

Para probar PWA:

```bash
NEXT_PUBLIC_PWA_ENABLED=true
```

En produccion se registra automaticamente.

## Objetivo

- Instalable desde navegador.
- Icono MSM.
- Experiencia tipo aplicacion.
- Cache basico de shell y recursos de marca.
- Preparada para internet lento.
