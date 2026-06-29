# Beta Privada

## Configuracion

`BETA_MODE=true` activa el modo beta controlado.

## Acceso

La tabla `beta_access` controla usuarios con estado `pendiente`, `aprobado` o `rechazado`.

El middleware redirige `/`, `/products` y `/marketplace` a `/beta` cuando beta esta activo y no existe una cookie interna de preview. Para produccion, reemplazar la cookie de preview por validacion real contra `beta_access` y rol del usuario autenticado.

## Objetivo operativo

Permite lanzar primero con clientes, vendedores VIP y equipo interno aprobados por MSM antes del lanzamiento publico.
