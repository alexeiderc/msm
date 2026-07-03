import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM || "MSM my store <orders@msmmystore.com>";

async function sendEmail(params: { to: string; subject: string; html: string }) {
  if (!resend) return { skipped: true, reason: "RESEND_API_KEY is not configured" };
  return resend.emails.send({ from, to: params.to, subject: params.subject, html: params.html });
}

export async function sendOrderReceipt(params: {
  to: string;
  orderNumber: string;
  total: string;
}) {
  return sendEmail({
    to: params.to,
    subject: `Factura digital ${params.orderNumber}`,
    html: `<p>Tu orden ${params.orderNumber} fue registrada por ${params.total}.</p>`
  });
}

export async function sendKycNotification(params: {
  to: string;
  status: string;
  fullName?: string | null;
  reason?: string | null;
}) {
  const isApproved = params.status === "aprobado";
  const subject = isApproved
    ? "KYC aprobado — Ya puedes operar en MSM"
    : "KYC rechazado — MSM reviso tu identificacion";

  const html = isApproved
    ? `<h2>Hola ${params.fullName ?? "usuario"}.</h2><p>Tu verificacion de identidad (KYC) fue <strong>aprobada</strong>.</p><p>Ya puedes realizar compras y operar sin restricciones en MSM my store.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://beta.msmmystore.com"}/products" style="display:inline-block;background:#0066cc;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Ir a productos</a></p>`
    : `<h2>Hola ${params.fullName ?? "usuario"}.</h2><p>Tu verificacion de identidad (KYC) fue <strong>rechazada</strong>.</p>${params.reason ? `<p>Motivo: ${params.reason}</p>` : ""}<p>Puedes volver a intentar en <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://beta.msmmystore.com"}/account/kyc">/account/kyc</a>.</p>`;

  return sendEmail({ to: params.to, subject, html });
}
