# Vision futurista IA MSM

MSM my store debe operar como una plataforma guiada por inteligencia artificial, pero liviana para clientes con internet lento.

## ELIANA como centro inteligente

ELIANA no debe ser solo un chat. Su funcion principal es entender la intencion del usuario y abrir el flujo correcto:

- Comprar producto o servicio: `/products`.
- Enviar remesa: `/remittances`.
- Crear cuenta: `/auth/signup`.
- Validar KYC: `/account/kyc`.
- Subir comprobante o seguir orden: `/orders`.
- Ver tienda oficial MSM: `/vendedores/msm-my-store-oficial-segundo-frente`.
- Abrir soporte: `/support`.
- Revisar vendedores VIP: `/tiendas-vip`.

El primer paso ya esta implementado como consola de comandos: funciona en local, no depende de clave externa y no consume datos pesados.

## Principios

1. Ligera primero: Cuba y zonas con internet lento deben poder usar la plataforma.
2. IA con control humano: pagos, KYC, aprobaciones, reclamos y suspensiones requieren revision MSM.
3. Seguridad por diseno: ELIANA nunca debe mostrar cuentas privadas fuera de una orden creada.
4. Auditoria: toda accion sensible debe quedar registrada en base de datos.
5. Rol y permisos: la IA solo debe acceder a datos permitidos por Supabase RLS y rol del usuario.

## Proximas fases

- Conectar ELIANA a busqueda real de productos por zona.
- Permitir que ELIANA consulte estado de orden despues de autenticar al cliente.
- Agregar herramientas internas por rol para VIP, economia, admin y Don Miguel.
- Crear alertas predictivas: pagos por revisar, ordenes atrasadas, riesgo de cliente, stock bajo y cuentas de pago saturadas.
- Activar respuestas por WhatsApp cuando MSM seleccione proveedor oficial.
