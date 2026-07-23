export type HelpArticle = {
  id: string;
  category: string;
  title: string;
  summary: string;
  steps: string[];
  href?: string;
  cta?: string;
};

export const helpArticles: HelpArticle[] = [
  {
    id: "crear-cuenta",
    category: "Cuenta",
    title: "Como crear cuenta MSM",
    summary: "La cuenta permite guardar datos, seguir ordenes, subir comprobantes, completar KYC y solicitar perfil VIP.",
    steps: [
      "Entra a Crear cuenta.",
      "Completa nombre, telefono, correo y contrasena.",
      "Elige si entras como cliente comprador o si quieres solicitar vendedor VIP.",
      "Antes de pagar, valida tus datos en KYC cliente.",
      "Si quieres vender, completa la solicitud VIP con zona, productos, horarios y evidencia."
    ],
    href: "/auth/signup",
    cta: "Crear cuenta"
  },
  {
    id: "kyc-cliente-antifraude",
    category: "Cuenta",
    title: "Por que MSM pide KYC al cliente",
    summary: "MSM verifica identidad, titular del pago y aceptacion antifraude antes de operar con mas confianza.",
    steps: [
      "Completa KYC en Cuenta.",
      "Usa tu nombre legal y un metodo de pago a tu nombre cuando sea posible.",
      "Si paga otra persona, explica el motivo en la nota.",
      "Acepta la politica contra reclamos falsos, contracargos indebidos y datos falsos.",
      "Economia puede revisar riesgo antes de liberar entrega o remesa."
    ],
    href: "/account/kyc",
    cta: "Completar KYC"
  },
  {
    id: "comprar-producto",
    category: "Compras",
    title: "Como comprar un producto",
    summary: "Busca el producto, revisa la tienda VIP responsable y crea una orden pendiente de pago.",
    steps: [
      "Crea cuenta y completa KYC cliente.",
      "Entra a Productos y busca por nombre, categoria, provincia o municipio.",
      "Abre Detalles para revisar precio, stock, garantia, zona de entrega y vendedor responsable.",
      "Toca Comprar y completa los datos del receptor en Cuba.",
      "Acepta los terminos del checkout y crea la orden."
    ],
    href: "/products",
    cta: "Buscar productos"
  },
  {
    id: "subir-comprobante",
    category: "Pagos",
    title: "Como subir un comprobante",
    summary: "La cuenta exacta se muestra solo dentro de una orden creada; despues subes la captura.",
    steps: [
      "Entra a Ordenes y abre la orden pendiente.",
      "Toca Comprobante.",
      "Sube una imagen o pega la URL de la captura.",
      "Agrega referencia, fecha y nombre de quien envio el dinero.",
      "Economia revisa y aprueba, rechaza o pide nueva evidencia."
    ],
    href: "/orders",
    cta: "Ver ordenes"
  },
  {
    id: "enviar-remesa",
    category: "Remesas",
    title: "Como crear una remesa",
    summary: "La remesa se registra por pais de pago, metodo, receptor, provincia, municipio y forma de entrega.",
    steps: [
      "Entra a Remesas.",
      "Confirma que tu KYC de cliente esta completo.",
      "Selecciona pais, moneda, metodo de pago y monto.",
      "Completa datos del receptor en Cuba.",
      "Selecciona si recibe efectivo, transferencia, MLC Clasica o MLC Tropical.",
      "Sube comprobante y espera revision economica."
    ],
    href: "/remittances",
    cta: "Crear remesa"
  },
  {
    id: "seguimiento-orden",
    category: "Ordenes",
    title: "Como dar seguimiento a una orden",
    summary: "Cada orden tiene estado, comprobante, soporte y eventos auditables.",
    steps: [
      "Entra a Ordenes.",
      "Revisa si esta pendiente de pago, pago confirmado, asignada, en ruta o entregada.",
      "Usa Comprobante para subir evidencia de pago.",
      "Usa Soporte si necesitas abrir reclamacion enlazada a esa orden."
    ],
    href: "/orders",
    cta: "Seguimiento"
  },
  {
    id: "vendedores-vip",
    category: "Tiendas VIP",
    title: "Como funcionan las tiendas VIP",
    summary: "Cada tienda o vendedor VIP tiene perfil, provincia, municipio, zona, reputacion y productos activos.",
    steps: [
      "Entra a Tiendas VIP.",
      "Abre un perfil para ver ubicacion, servicios, zonas, remesas y productos.",
      "Compra productos publicados por tiendas activas con zona real.",
      "MSM controla tecnologia, pago, orden, ledger y auditoria."
    ],
    href: "/tiendas-vip",
    cta: "Ver tiendas VIP"
  },
  {
    id: "abrir-reclamacion",
    category: "Soporte",
    title: "Como abrir una reclamacion",
    summary: "Las reclamaciones se abren por orden y quedan documentadas.",
    steps: [
      "Entra a Ordenes.",
      "Busca la orden afectada y toca Soporte.",
      "Elige motivo: demora, producto incorrecto, producto danado, falta de entrega, garantia u otro.",
      "Describe lo ocurrido y adjunta evidencia si la tienes.",
      "Administracion revisa y documenta la resolucion."
    ],
    href: "/support",
    cta: "Abrir soporte"
  },
  {
    id: "metodos-activos",
    category: "Pagos",
    title: "Donde ver metodos de pago activos",
    summary: "La pagina publica solo muestra pais, metodo y estado; nunca publica cuentas exactas.",
    steps: [
      "Entra a Metodos activos.",
      "Revisa si el metodo esta activo, pausado u oculto.",
      "Crea una orden para recibir instrucciones y cuenta asignada.",
      "No uses cuentas anteriores."
    ],
    href: "/payment-methods",
    cta: "Ver metodos"
  },
  {
    id: "seguridad",
    category: "Confianza",
    title: "Como MSM protege la operacion",
    summary: "MSM registra eventos, comprobantes, auditoria, alertas antifraude y ledger financiero.",
    steps: [
      "Cada orden tiene numero unico y eventos.",
      "Economia revisa comprobantes antes de activar entrega.",
      "Las cuentas rotativas se asignan dentro de la orden.",
      "Los vendedores VIP entregan con evidencia.",
      "Las incidencias quedan enlazadas a orden y soporte."
    ],
    href: "/how-it-works",
    cta: "Como funciona"
  }
];
