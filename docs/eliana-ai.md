# Eliana IA

Eliana es la asistente inteligente oficial de MSM my store. Su objetivo es orientar a clientes, vendedores VIP, administradores y area economica sin exponer datos privados ni reemplazar revision humana.

## Que puede hacer

- Guiar compras de productos y servicios.
- Guiar creacion de cuenta en `/auth/signup` y validacion en `/account/kyc`.
- Explicar como crear remesas.
- Indicar como subir comprobantes de pago.
- Orientar seguimiento de ordenes.
- Explicar metodos activos sin mostrar cuentas exactas.
- Ayudar a vendedores VIP con productos, stock, zonas y evidencias.
- Orientar soporte, reclamaciones e incidencias.
- Guiar a economia y administracion hacia los paneles correctos.
- Mostrar enlaces internos clicables para abrir productos, remesas, ordenes, soporte, metodos y tiendas VIP.
- Empoderar al cliente: explicar que revisar, como comparar por zona, como proteger su pago y cuando pedir soporte humano.

## Reglas de seguridad

- Eliana no debe inventar cuentas de pago.
- Eliana no debe prometer disponibilidad, precios, entrega o aprobacion economica sin datos reales del sistema.
- Eliana no debe dar asesoria legal, financiera o migratoria como definitiva.
- Las cuentas exactas solo se muestran dentro de una orden o remesa creada.
- El cliente no debe pagar por cuentas viejas, mensajes externos o instrucciones no enlazadas a una orden MSM.
- Los casos sensibles deben confirmarse por administracion MSM.

## Variables de entorno

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
ELIANA_AI_ENABLED=true
```

Si `OPENAI_API_KEY` esta vacia o `ELIANA_AI_ENABLED=false`, Eliana responde en modo demo local. Esto permite probar la interfaz sin gastar ni usar datos reales.

## Rutas

- `/eliana`: pagina publica del asistente.
- `/api/eliana`: endpoint interno del servidor.
- `/ia` y `/asistente`: redirigen a `/eliana`.
- `/auth/signup`: creacion de cuenta recomendada por ELIANA cuando el usuario quiera empezar.

## Enlaces abiertos por ELIANA

Cuando ELIANA escribe una ruta interna como `/auth/signup`, `/products`, `/remittances`, `/orders`, `/support`, `/payment-methods` o `/tiendas-vip`, la interfaz la convierte en enlace clicable. El widget flotante tambien muestra botones directos para abrir esas secciones.

## Widget flotante

El widget aparece al abrir la web, se oculta solo y vuelve a invitar al cliente cada cierto tiempo. El objetivo es que ELIANA este presente sin bloquear la compra.

## Produccion

1. Crear una clave API real en OpenAI.
2. Guardarla solo en variables de entorno de Vercel o servidor.
3. Elegir el modelo en `OPENAI_MODEL`.
4. Mantener `ELIANA_AI_ENABLED=true`.
5. Probar preguntas de compra, remesa, comprobante, soporte y vendedor VIP antes del beta publico.

## Futuro

- Conectar Eliana a datos reales de ordenes con permisos por usuario.
- Registrar conversaciones importantes como soporte interno.
- Permitir handoff a WhatsApp cuando el modulo WhatsApp este activo.
- Agregar herramientas internas para buscar ordenes, productos y metodos activos con RLS.
