import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "1. Identidad de la plataforma",
    body: [
      "MSM my store es la plataforma principal operada en msmmystore.com. Dentro del sistema, el modulo operativo puede llamarse MSM Marketplace, pero la experiencia publica para clientes, vendedores y administradores se presenta bajo la marca MSM my store.",
      "MSM my store ofrece tecnologia, organizacion digital, gestion de ordenes, control de pagos, ledger financiero, auditoria operativa, canales de soporte y herramientas de confianza para facilitar compras destinadas a receptores dentro de Cuba."
    ]
  },
  {
    title: "2. Naturaleza del servicio",
    body: [
      "MSM my store actua como plataforma tecnologica, intermediario de pagos, organizador digital del proceso comercial y administrador de la trazabilidad de las ordenes.",
      "Los vendedores VIP son vendedores independientes. MSM no fabrica, importa, almacena ni garantiza directamente todos los productos o servicios publicados por vendedores independientes, salvo cuando se indique expresamente lo contrario en una operacion especifica.",
      "Cada vendedor VIP es responsable por la veracidad de sus publicaciones, disponibilidad, precio, calidad, garantia, cumplimiento de entrega, tiempos de respuesta, evidencia de entrega y atencion al cliente."
    ]
  },
  {
    title: "3. Usuarios compradores",
    body: [
      "El comprador debe proporcionar datos reales, actualizados y verificables. Esto puede incluir nombre completo, telefono, correo electronico, direccion, metodo de pago validado y cualquier informacion adicional necesaria para prevenir fraude o completar la entrega.",
      "El comprador declara que la informacion del receptor en Cuba es correcta, incluyendo nombre completo, telefono, provincia, municipio, direccion, referencias, horario de entrega y notas adicionales.",
      "MSM puede solicitar validacion de identidad, telefono, correo, metodo de pago o comprobante cuando lo considere necesario para proteger la operacion.",
      "Antes de pagar compras o crear remesas, MSM puede requerir KYC cliente, titular de pago y aceptacion expresa contra reclamaciones falsas, desconocimiento malicioso del pago o contracargos indebidos."
    ]
  },
  {
    title: "4. Receptores en Cuba",
    body: [
      "El receptor es la persona indicada por el comprador para recibir el producto o servicio dentro de Cuba.",
      "El comprador es responsable de confirmar que el receptor puede ser contactado, conoce la entrega y estara disponible en la direccion y horario indicados.",
      "Si el receptor no responde, no esta disponible, entrega datos incorrectos o impide la entrega, la orden puede requerir reprogramacion, ajuste, investigacion o cierre documentado segun el caso."
    ]
  },
  {
    title: "5. Vendedores VIP independientes",
    body: [
      "El acceso como vendedor VIP requiere solicitud, revision, KYC, informacion de contacto, ubicacion, zona de operacion, categorias trabajadas, evidencia de producto o servicio, capacidad diaria, horario, garantia ofrecida y aceptacion del acuerdo vendedor VIP.",
      "MSM puede aprobar, rechazar, suspender, pedir mas informacion o limitar la operacion de un vendedor por motivos de confianza, riesgo, incumplimiento, fraude, reclamaciones repetidas, datos falsos o baja calidad de servicio.",
      "El vendedor VIP acepta que MSM puede auditar ordenes, evidencias, reclamos, saldos, comisiones y actividad operativa relacionada con la plataforma."
    ]
  },
  {
    title: "6. Productos, servicios e inventario",
    body: [
      "Los productos y servicios publicados deben describirse con claridad suficiente para que el comprador entienda precio, disponibilidad, zona de entrega, tiempo prometido, condiciones y garantia.",
      "El vendedor puede publicar productos propios, productos disponibles localmente, productos obtenidos a traves de comercios, MLC, mipymes, cuentapropistas, mayoristas, distribuidores, importadores privados u otras fuentes legales o permitidas por su operacion.",
      "Si el vendedor publica un producto sin tenerlo fisicamente almacenado, sigue siendo responsable de conseguirlo, validar disponibilidad, respetar precio confirmado y cumplir la entrega dentro del tiempo acordado."
    ]
  },
  {
    title: "7. Precios, comisiones y ledger",
    body: [
      "MSM registra para cada orden la venta bruta, comision MSM, comision de pasarela o costo financiero cuando aplique, neto del vendedor, saldo pendiente, saldo pagado y movimientos relacionados.",
      "Las comisiones pueden variar por categoria, acuerdo comercial, vendedor, promocion, riesgo operativo o decision administrativa.",
      "El vendedor acepta que el ledger interno de MSM es el registro operativo principal para cierres, saldos, auditoria y pagos."
    ]
  },
  {
    title: "8. Metodos de pago",
    body: [
      "El comprador debe pagar exclusivamente por los metodos indicados por MSM my store dentro del flujo de una orden.",
      "Los metodos pueden incluir Zelle, Cash App, Venmo, Bizum, IBAN, transferencia, Oxxo, USDT, PayPal, pago movil u otros, segun pais, moneda, disponibilidad y politicas internas.",
      "Las cuentas exactas, alias, instrucciones sensibles o datos internos de pago no se muestran en paginas publicas. Solo se muestran dentro de una orden creada y cuando el sistema asigna una cuenta disponible.",
      "MSM puede activar, pausar, ocultar o bloquear metodos y cuentas de pago por capacidad diaria, riesgo, revision interna, fraude, mantenimiento o decision economica."
    ]
  },
  {
    title: "9. Comprobantes de pago",
    body: [
      "Despues de crear una orden, el comprador debe subir comprobante de pago cuando el metodo seleccionado lo requiera. El comprobante puede incluir captura, referencia, monto, moneda, pais, metodo, fecha y nombre de quien envio el dinero.",
      "La orden permanece en estado pendiente_pago hasta que el area economica revise el comprobante.",
      "El area economica puede aprobar, rechazar o pedir nueva evidencia. Al aprobar, la orden cambia a pago_confirmado y se activa la entrega VIP.",
      "Subir un comprobante falso, repetido, incompleto, alterado o no correspondiente a la cuenta asignada puede provocar cancelacion, bloqueo, investigacion, suspension de cuenta o registro antifraude."
    ]
  },
  {
    title: "10. Ordenes y estados",
    body: [
      "Cada orden recibe un numero unico y queda registrada con eventos de tiempo, cambios de estado y acciones relevantes.",
      "Los estados operativos pueden incluir pendiente_pago, pago_confirmado, asignada_vip, confirmada_vip, preparando, en_ruta, entregada, cerrada, incidencia y cancelada.",
      "MSM puede reasignar una orden a otro vendedor VIP si el vendedor asignado no confirma disponibilidad dentro del plazo configurado, no puede cumplir, presenta riesgo operativo o existe una incidencia que lo justifique."
    ]
  },
  {
    title: "11. Entregas en Cuba",
    body: [
      "La entrega local es ejecutada por el vendedor VIP independiente o por la estructura operativa que este organice bajo su responsabilidad.",
      "El vendedor debe coordinar disponibilidad, preparar el producto, marcar estados de avance y completar la entrega segun los datos proporcionados.",
      "La entrega puede documentarse mediante foto, firma, mensaje, codigo OTP u otra evidencia aceptada por MSM.",
      "MSM puede usar la evidencia de entrega para cerrar la orden, analizar reclamaciones, medir reputacion y auditar cumplimiento."
    ]
  },
  {
    title: "12. Garantias",
    body: [
      "La garantia de cada producto o servicio es responsabilidad del vendedor independiente, salvo pacto escrito distinto.",
      "El vendedor debe indicar si existe garantia, plazo, condiciones, cobertura, reparacion, reemplazo o limitaciones aplicables.",
      "No existe reembolso automatico despues de una entrega documentada. Las soluciones pueden incluir reparacion, reemplazo, credito interno, acuerdo entre partes o cierre documentado."
    ]
  },
  {
    title: "13. Reclamaciones y soporte",
    body: [
      "El comprador puede abrir reclamaciones por demora, producto incorrecto, producto danado, falta de entrega, garantia u otro motivo relacionado con una orden.",
      "Las reclamaciones deben presentarse por escrito a commercial@msmmystore.com dentro de 30 dias desde la entrega o desde el evento que origina la reclamacion.",
      "MSM puede solicitar evidencia al cliente, al receptor o al vendedor VIP. Las conversaciones, archivos, decisiones y resoluciones pueden quedar asociadas a la orden.",
      "Las resoluciones pueden incluir reparacion, reemplazo, credito interno, acuerdo entre partes, reasignacion operativa, cierre documentado o rechazo motivado de la reclamacion."
    ]
  },
  {
    title: "14. Fuerza mayor",
    body: [
      "Las demoras, cambios o incumplimientos derivados de clima, transporte, electricidad, conectividad, escasez, enfermedad, accidentes, restricciones oficiales, disposiciones regulatorias, interrupciones logisticas u otros eventos fuera del control razonable de MSM o del vendedor se consideran fuerza mayor.",
      "Cuando exista fuerza mayor, MSM y el vendedor procuraran documentar el evento, comunicar el estado y proponer alternativas razonables cuando sea posible."
    ]
  },
  {
    title: "15. Antifraude y seguridad",
    body: [
      "MSM puede registrar alertas antifraude si el monto no coincide, el comprobante esta repetido, existen muchas ordenes pendientes, una cuenta supera su capacidad diaria, el metodo esta pausado, el pais no coincide o el comprador intenta pagar por una cuenta anterior.",
      "MSM puede suspender, bloquear, cancelar, investigar o limitar cuentas por fraude, abuso, pagos falsos, reclamaciones maliciosas, datos falsos, comportamiento riesgoso o uso indebido de la plataforma.",
      "Una reclamacion real se atiende por soporte y evidencia; una reclamacion falsa o contracargo indebido despues de entrega documentada puede quedar registrado como riesgo antifraude.",
      "Las acciones sensibles pueden quedar registradas en logs de auditoria con usuario, fecha, entidad, evento, estado anterior y estado posterior."
    ]
  },
  {
    title: "16. Privacidad y datos",
    body: [
      "MSM recopila los datos necesarios para operar la plataforma, procesar ordenes, validar pagos, coordinar entregas, atender reclamaciones, cumplir auditoria y proteger contra fraude.",
      "Los datos del receptor se comparten con el vendedor VIP solo en la medida necesaria para ejecutar la entrega.",
      "MSM no debe publicar informacion sensible de pago, datos privados de clientes, direcciones completas o comprobantes en paginas publicas."
    ]
  },
  {
    title: "17. Notificaciones",
    body: [
      "MSM puede enviar notificaciones por correo electronico y, en una fase futura, por WhatsApp u otros canales autorizados.",
      "Las notificaciones pueden incluir orden creada, pago pendiente, comprobante recibido, pago aprobado, orden asignada, confirmacion VIP, preparando, en ruta, entregada, incidencia, reclamacion y payout enviado.",
      "Las notificaciones tienen finalidad informativa y operativa. El estado oficial de la orden es el registrado dentro del sistema MSM."
    ]
  },
  {
    title: "18. Beta privada",
    body: [
      "MSM puede operar la plataforma en beta privada antes del lanzamiento publico.",
      "Durante la beta, MSM puede limitar acceso a clientes, vendedores y administradores aprobados, ajustar rutas, cambiar funcionalidades, pausar metodos, suspender operaciones o modificar procesos para proteger la calidad del servicio."
    ]
  },
  {
    title: "19. Cambios en estos terminos",
    body: [
      "MSM puede actualizar estos terminos para reflejar cambios operativos, legales, tecnicos o comerciales.",
      "La version aplicable a una orden puede registrarse junto con la aceptacion legal del comprador o del vendedor, incluyendo fecha, usuario, IP cuando aplique y version del documento."
    ]
  },
  {
    title: "20. Contacto oficial",
    body: [
      "Para reclamaciones, soporte comercial o asuntos relacionados con ordenes, el canal escrito oficial es commercial@msmmystore.com.",
      "MSM puede requerir que toda reclamacion, acuerdo, evidencia o resolucion relevante quede documentada por escrito para proteger a comprador, vendedor y plataforma."
    ]
  }
];

export default function TermsPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-6 pb-24">
        <Badge>Terminos y condiciones</Badge>
        <h1 className="mt-3 text-3xl font-bold">Terminos y Condiciones de MSM my store</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Estos terminos regulan el uso de MSM my store, las compras destinadas a Cuba, la relacion con vendedores VIP
          independientes, los pagos manuales, las entregas, la auditoria, el soporte y las reclamaciones.
        </p>

        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-msm-ink">
          <strong>Nota importante:</strong> este texto es una base operativa para el MVP. Antes del lanzamiento publico
          debe ser revisado por asesoria legal competente segun las jurisdicciones donde opere MSM, los compradores,
          los pagos y los vendedores independientes.
        </div>

        <div className="mt-6 grid gap-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-msm-line bg-white p-5 shadow-soft">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-msm-line bg-msm-ink p-5 text-white">
          <h2 className="text-lg font-bold">Aceptacion obligatoria en checkout</h2>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Antes de crear una orden, el comprador debe aceptar estos terminos y autorizar el registro auditable de la
            aceptacion. Sin aceptacion, MSM my store no debe procesar la orden.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
