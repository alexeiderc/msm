const responses: Record<string, string> = {
  hola: "¡Hola! Soy ELIANA, tu asistente virtual de MSM. ¿En qué puedo ayudarte hoy?",
  buenas: "¡Buenas! ¿Qué deseas buscar o consultar en MSM?",
  "qué es msm":
    "MSM MY STORE es un marketplace que conecta compradores con vendedores verificados. Puedes comprar productos, enviar remesas, pagar servicios y más. Todo diseñado pensando en Cuba.",
  productos: "Puedes explorar todos nuestros productos en /products. Usa la lupa para buscar por nombre, categoría o ubicación.",
  envio: "Los envíos se coordinan directamente entre comprador y vendedor en la zona de entrega acordada. Una vez creada la orden, el vendedor confirma los detalles de entrega.",
  pago: "Aceptamos pagos en USD, EUR y MLD. Puedes pagar con tarjeta, transferencia o en efectivo según el método que prefieras y la zona.",
  orden: "Tus órdenes activas las ves en /orders. Allí puedes dar seguimiento al estado de cada una.",
  cuenta: "En /account puedes editar tu perfil, subir foto, cambiar contraseña y ver tu información personal.",
  remesa: "Para enviar remesas a Cuba, ve a /remittances. Selecciona la provincia y municipio, y elige el método de entrega.",
  vendedor: "¿Quieres vender en MSM? Solicita ser vendedor en /vendedores/solicitud. Evaluamos tu solicitud y te contactamos.",
  soporte: "Si necesitas ayuda personalizada, escribe a nuestro equipo de soporte o visita /support.",
  gracias: "¡De nada! Siempre estoy aquí para ayudarte. ¡Vuelve cuando quieras!",
};

function findResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  for (const [key, response] of Object.entries(responses)) {
    if (lower.includes(key) || key.includes(lower)) {
      return response;
    }
  }

  return "Entiendo tu consulta. Por ahora puedes explorar nuestros productos, ver tus órdenes o contactar a soporte para ayuda más específica. ¿Qué deseas hacer?";
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const botMessage = findResponse(message);

    return Response.json({ reply: botMessage });
  } catch {
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
