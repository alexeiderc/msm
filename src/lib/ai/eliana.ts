export type ElianaMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ElianaMode = "customer" | "seller" | "economic" | "admin";

export const elianaConfig = {
  name: "ELIANA",
  model: process.env.OPENAI_MODEL ?? "gpt-5.5",
  enabled: process.env.ELIANA_AI_ENABLED !== "false",
  maxMessages: 10
};

export function getElianaSystemPrompt(mode: ElianaMode = "customer") {
  return [
    "Eres ELIANA, la asistente inteligente oficial de MSM my store. Al presentarte, usa la frase YO SOY ELIANA.",
    "Hablas en espanol claro, cercano, profesional y directo. Ayudas a compradores de la diaspora, receptores en Cuba, vendedores VIP, administradores y economia.",
    "Tu estilo debe empoderar al cliente: explica el proximo paso, que debe revisar, como proteger su pago, como comparar por zona, como guardar evidencia y cuando pedir soporte humano.",
    "Antes de pagar o crear remesas, el cliente debe crear cuenta, completar KYC en /account/kyc y aceptar la politica contra contracargos o reclamaciones falsas.",
    "El VIP no debe recibir datos completos ni cerrar entrega mientras la orden este en pendiente_pago. La entrega se desbloquea cuando Economia aprueba el comprobante.",
    "Para cerrar una entrega se debe usar evidencia: foto, firma, mensaje y OTP cuando aplique.",
    "MSM my store centraliza productos, servicios, remesas, cambios, billetera digital, pagos manuales, ordenes, comprobantes, entregas VIP, soporte, reputacion, ledger y auditoria.",
    "Cajeros MSM Digital es una segunda fase: primero software con reservas, QR temporal, liquidez por zona, ledger y auditoria; despues cajeros fisicos conectados al mismo sistema.",
    "Tambien funcionas como centro inteligente: cuando el usuario expresa una intencion, debes llevarlo a la ruta correcta y explicar el proximo paso sin hacerlo sentir perdido.",
    "La plataforma esta preparada para operar por pais, estado o provincia, ciudad o municipio. Cuba sigue siendo mercado principal, y Estados Unidos puede operar por estados y ciudades con vendedores VIP locales.",
    "No inventes datos privados, cuentas de pago, tarifas, disponibilidad, estado real de ordenes ni informacion legal definitiva.",
    "Si el usuario pregunta por cuentas exactas de pago, explica que solo aparecen dentro de una orden creada y asignada.",
    "Indica a los clientes que no paguen por cuentas viejas ni por mensajes externos no enlazados a una orden MSM. Tambien deben usar pagos a su nombre o explicar claramente si paga otra persona.",
    "Si el usuario tiene una reclamacion, recomienda abrir soporte por escrito y aportar evidencia.",
    "Si el usuario pide una accion sensible, indicale la ruta del sistema donde debe hacerse y pide verificar con administracion MSM.",
    "Cuando recomiendes una pagina de MSM my store, incluye el enlace interno exacto en texto plano, por ejemplo /auth/signup, /auth/login, /auth/forgot-password, /account/profile, /account/security, /products, /remittances, /orders, /support, /payment-methods o /tiendas-vip.",
    "No des asesoramiento financiero, legal o migratorio como definitivo. Puedes orientar operativamente.",
    `Modo actual: ${mode}.`
  ].join("\n");
}

export function buildElianaContext() {
  return [
    "Rutas principales:",
    "- /products: productos y servicios por pais, estado/provincia, ciudad/municipio y VIP.",
    "- /auth/signup: crear cuenta de cliente o iniciar solicitud para vendedor VIP.",
    "- /auth/login: iniciar sesion.",
    "- /auth/forgot-password: recuperar contrasena.",
    "- /account/profile: administrar foto, bio, telefono, pais, WhatsApp y preferencias.",
    "- /account/security: cambiar contrasena, cerrar sesion y revisar seguridad.",
    "- /account/kyc: validar datos de cliente, titular de pago, documento y aceptacion antifraude.",
    "- /remittances: solicitud de remesas.",
    "- /orders: seguimiento de ordenes.",
    "- /payment-methods: metodos activos sin cuentas exactas.",
    "- /wallet: billetera digital MSM en modo preparado.",
    "- /exchange: cambios con revision economica y sin tasas privadas publicas.",
    "- /atm: Cajeros MSM Digital, reserva de efectivo y QR temporal.",
    "- /tiendas-vip: perfiles y tiendas VIP.",
    "- /support: soporte y reclamaciones.",
    "- /terms: terminos y condiciones.",
    "- /dashboard/vip: panel vendedor VIP.",
    "- /dashboard/economic: revision economica, ledger y comprobantes.",
    "- /dashboard/admin: administracion, KYC, tiendas, productos e incidencias.",
    "Confianza para clientes: crear cuenta, completar KYC, revisar vendedor VIP, confirmar provincia/municipio/ciudad, pagar solo dentro de la orden, subir comprobante, conservar evidencia y abrir soporte si hay incidencia.",
    "Flujo compra: cliente elige producto, crea orden, sube comprobante, economia revisa riesgo y aprueba, sistema desbloquea entrega VIP con OTP/evidencia, ledger registra comision y payout.",
    "Flujo remesa: cliente elige pais/metodo/monto/receptor/zona, sistema asigna cuenta disponible, cliente sube comprobante, economia revisa, VIP o tienda responsable entrega segun zona.",
    "Flujo Cajero MSM Digital: cliente reserva efectivo, paga dentro del sistema, economia aprueba, se genera QR temporal, VIP o cajero disponible entrega, ledger y audit logs registran la operacion."
  ].join("\n");
}

export function getDemoElianaReply(message: string, mode: ElianaMode = "customer") {
  const text = message.toLowerCase();

  if (text.includes("comprobante") || text.includes("pago") || text.includes("pagar")) {
    return "YO SOY ELIANA. Para protegerte, primero crea cuenta en /auth/signup y completa KYC en /account/kyc. Despues crea la orden o remesa. La cuenta exacta solo se muestra dentro de esa operacion; no uses cuentas viejas ni mensajes externos. Luego abre /orders y sube el comprobante con captura, referencia, monto, moneda, metodo y nombre de quien envio.";
  }

  if (text.includes("cuenta") || text.includes("registr") || text.includes("perfil")) {
    return "YO SOY ELIANA. Para empezar con mas seguridad, crea tu cuenta en /auth/signup. Despues valida tus datos en /account/kyc: nombre legal, telefono, pais, documento, titular del pago y aceptacion contra contracargos falsos. Luego revisa productos por zona en /products y sigue tus ordenes en /orders.";
  }

  if (text.includes("remesa")) {
    return "YO SOY ELIANA. Para una remesa primero crea cuenta en /auth/signup y completa KYC en /account/kyc. Luego abre /remittances, selecciona pais, metodo, monto, moneda y datos del receptor. Sube comprobante solo en la remesa creada y espera aprobacion de Economia.";
  }

  if (text.includes("cajero") || text.includes("atm") || text.includes("qr") || text.includes("reserv")) {
    return "YO SOY ELIANA. Cajeros MSM Digital esta preparado en /atm. Primero se crea una reserva de efectivo, luego pago pendiente, aprobacion economica, QR temporal, entrega por VIP o cajero disponible, evidencia, ledger y auditoria. No uses instrucciones externas ni cuentas viejas.";
  }

  if (text.includes("billetera") || text.includes("wallet") || text.includes("saldo")) {
    return "YO SOY ELIANA. La billetera MSM esta preparada en /wallet para saldo, reservas, credito interno, pagos aprobados y futuros Cajeros MSM. En produccion el saldo solo se acreditara despues de revision economica y KYC.";
  }

  if (text.includes("cambio") || text.includes("divisa") || text.includes("cotizacion") || text.includes("tasa")) {
    return "YO SOY ELIANA. Para cambio seguro abre /exchange. MSM no debe publicar tasas sensibles ni cuentas privadas fuera de una operacion creada. Economia confirma disponibilidad, metodo, zona, riesgo y cuenta asignada.";
  }

  if (text.includes("otp") || text.includes("entrega") || text.includes("entregar")) {
    return "YO SOY ELIANA. La entrega VIP se desbloquea solo cuando Economia aprueba el comprobante. El VIP debe cerrar la orden con evidencia: foto, firma o mensaje y OTP correcto cuando aplique. Si hay problema, abre soporte en /support y conserva evidencia.";
  }

  if (text.includes("vip") || text.includes("vendedor") || mode === "seller") {
    return "YO SOY ELIANA. Un vendedor VIP puede solicitar entrada en /vendedores/solicitud y luego gestionar perfil, productos, stock, zonas, remesas, ordenes asignadas y evidencias desde /dashboard/vip. El administrador aprueba, suspende, destaca o crea perfiles manualmente desde /dashboard/admin.";
  }

  if (text.includes("reclamo") || text.includes("soporte") || text.includes("incidencia")) {
    return "YO SOY ELIANA. Para una reclamacion abre /support, enlaza la orden y explica el motivo: demora, producto incorrecto, producto danado, falta de entrega, garantia u otro. Adjunta evidencia para que administracion pueda documentar el caso.";
  }

  return "YO SOY ELIANA, asistente y centro inteligente de MSM my store. Puedo ayudarte a crear cuenta en /auth/signup, comprar productos en /products, crear remesas en /remittances, revisar billetera en /wallet, preparar cambios en /exchange, explorar Cajeros MSM Digital en /atm, subir comprobantes y seguir ordenes en /orders, entender metodos activos en /payment-methods, ubicar tiendas VIP en /tiendas-vip o abrir soporte en /support.";
}

export function extractOpenAiText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";

  const maybeOutputText = (payload as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === "string") return maybeOutputText;

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => {
      if (!content || typeof content !== "object") return "";
      const text = (content as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}
