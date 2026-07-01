import { sendOrderReceipt } from "@/lib/email";
import { queueWhatsAppMessage } from "@/lib/whatsapp";
import { createAdminClient } from "@/lib/supabase/admin";

function resolveTemplate(templateName: string): { subject: string; body: string } | null {
  try {
    const templates: Record<string, { subject: string; body: string }> = {
      "order-created": {
        subject: "Orden creada {{orderNumber}}",
        body: "Tu orden {{orderNumber}} fue creada en MSM my store. Completa el pago usando el metodo asignado dentro de tu orden."
      },
      "payment-pending": {
        subject: "Pago pendiente {{orderNumber}}",
        body: "Tu orden {{orderNumber}} sigue pendiente de pago. Sube el comprobante para que el area economica pueda revisarlo."
      },
      "payment-proof-received": {
        subject: "Comprobante recibido {{orderNumber}}",
        body: "Recibimos tu comprobante de pago para la orden {{orderNumber}}. MSM Economia lo revisara antes de activar la entrega."
      },
      "payment-approved": {
        subject: "Pago aprobado {{orderNumber}}",
        body: "El pago de la orden {{orderNumber}} fue aprobado. La entrega VIP queda activada."
      },
      "order-assigned-vip": {
        subject: "Orden asignada a VIP {{orderNumber}}",
        body: "La orden {{orderNumber}} fue asignada a un vendedor VIP verificado."
      },
      "vip-confirmed": {
        subject: "VIP confirmo disponibilidad {{orderNumber}}",
        body: "El vendedor VIP confirmo disponibilidad para la orden {{orderNumber}}."
      },
      "preparing": {
        subject: "Orden en preparacion {{orderNumber}}",
        body: "La orden {{orderNumber}} esta en preparacion."
      },
      "on-route": {
        subject: "Orden en ruta {{orderNumber}}",
        body: "La orden {{orderNumber}} esta en ruta de entrega."
      },
      "delivered": {
        subject: "Orden entregada {{orderNumber}}",
        body: "La orden {{orderNumber}} fue marcada como entregada con evidencia."
      },
      "incident-opened": {
        subject: "Incidencia abierta {{orderNumber}}",
        body: "Se abrio una incidencia para la orden {{orderNumber}}. MSM la revisara."
      },
      "claim-received": {
        subject: "Reclamacion recibida {{ticketId}}",
        body: "Recibimos tu reclamacion {{ticketId}} y quedo enlazada a la orden {{orderNumber}}."
      },
      "payment-method-paused": {
        subject: "Metodo de pago pausado {{methodName}}",
        body: "El metodo {{methodName}} fue pausado. No debe mostrarse como disponible para nuevas ordenes."
      },
      "payout-sent": {
        subject: "Payout enviado {{payoutId}}",
        body: "MSM registro un payout por {{amount}} para el vendedor VIP {{sellerName}}."
      }
    };

    return templates[templateName] ?? null;
  } catch {
    return null;
  }
}

function substitute(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

export async function notifyOrderCreated(params: {
  orderNumber: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  userId: string;
  orderId: string;
}) {
  const template = resolveTemplate("order-created");
  if (!template) return;
  const subject = substitute(template.subject, { orderNumber: params.orderNumber });
  const body = substitute(template.body, { orderNumber: params.orderNumber });

  if (params.customerEmail) {
    await sendOrderReceipt({ to: params.customerEmail, orderNumber: params.orderNumber, total: "" }).catch(() => {});
  }

  if (params.customerPhone) {
    await queueWhatsAppMessage({
      to: params.customerPhone,
      template: "order_created",
      variables: { orderNumber: params.orderNumber }
    }).catch(() => {});
  }

  try { await createAdminClient().from("notifications").insert({
    user_id: params.userId,
    channel: "in_app",
    title: subject,
    body,
    metadata: { order_id: params.orderId, order_number: params.orderNumber, template: "order-created" }
  }); } catch {}
}

export async function notifyPaymentProofReceived(params: {
  orderNumber: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  userId: string;
  orderId: string;
}) {
  const template = resolveTemplate("payment-proof-received");
  if (!template) return;
  const subject = substitute(template.subject, { orderNumber: params.orderNumber });
  const body = substitute(template.body, { orderNumber: params.orderNumber });

  if (params.customerEmail) {
    await sendOrderReceipt({ to: params.customerEmail, orderNumber: params.orderNumber, total: "" }).catch(() => {});
  }

  try { await createAdminClient().from("notifications").insert({
    user_id: params.userId,
    channel: "in_app",
    title: subject,
    body,
    metadata: { order_id: params.orderId, order_number: params.orderNumber, template: "payment-proof-received" }
  }); } catch {}
}

export async function notifyPaymentApproved(params: {
  orderNumber: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  userId: string;
  orderId: string;
}) {
  const template = resolveTemplate("payment-approved");
  if (!template) return;
  const subject = substitute(template.subject, { orderNumber: params.orderNumber });
  const body = substitute(template.body, { orderNumber: params.orderNumber });

  if (params.customerEmail) {
    await sendOrderReceipt({ to: params.customerEmail, orderNumber: params.orderNumber, total: "" }).catch(() => {});
  }

  if (params.customerPhone) {
    await queueWhatsAppMessage({
      to: params.customerPhone,
      template: "payment_approved",
      variables: { orderNumber: params.orderNumber }
    }).catch(() => {});
  }

  try { await createAdminClient().from("notifications").insert({
    user_id: params.userId,
    channel: "in_app",
    title: subject,
    body,
    metadata: { order_id: params.orderId, order_number: params.orderNumber, template: "payment-approved" }
  }); } catch {}
}

export async function notifyOrderStatusChange(params: {
  orderNumber: string;
  status: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  userId: string;
  orderId: string;
}) {
  const templateName: Record<string, string> = {
    asignada_vip: "order-assigned-vip",
    confirmada_vip: "vip-confirmed",
    preparando: "preparing",
    en_ruta: "on-route",
    entregada: "delivered",
    incidencia: "incident-opened"
  };

  const mapped = templateName[params.status];
  if (!mapped) return;

  const template = resolveTemplate(mapped);
  if (!template) return;

  const subject = substitute(template.subject, { orderNumber: params.orderNumber });
  const body = substitute(template.body, { orderNumber: params.orderNumber });

  if (params.customerEmail) {
    await sendOrderReceipt({ to: params.customerEmail, orderNumber: params.orderNumber, total: "" }).catch(() => {});
  }

  if (params.customerPhone) {
    await queueWhatsAppMessage({
      to: params.customerPhone,
      template: mapped.replace(/-/g, "_"),
      variables: { orderNumber: params.orderNumber }
    }).catch(() => {});
  }

  try { await createAdminClient().from("notifications").insert({
    user_id: params.userId,
    channel: "in_app",
    title: subject,
    body,
    metadata: { order_id: params.orderId, order_number: params.orderNumber, template: mapped, status: params.status }
  }); } catch {}
}
