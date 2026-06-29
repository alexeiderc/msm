# Onboarding Vendedor VIP

## Solicitud

La ruta `/vendedores/solicitud` recoge nombre completo, telefono, provincia, municipio, comunidad de origen, WhatsApp o Telegram, categorias, video, fotos, zona de entrega, horario, capacidad diaria, garantia ofrecida y aceptacion del acuerdo vendedor VIP.

## Revision administrativa

El administrador puede aprobar, rechazar, pedir mas informacion o suspender. Cada decision debe registrarse en `audit_logs`.

## Acuerdo digital

El vendedor acepta responsabilidad por veracidad, disponibilidad, precio, entrega, calidad, garantia, evidencia de entrega, tiempos de respuesta y cumplimiento. MSM cobra comision, organiza plataforma, controla pagos y puede suspender por fraude, incumplimiento, reclamaciones repetidas o datos falsos.

La aceptacion se guarda en `seller_agreements` con fecha, IP cuando este disponible, version y usuario.
