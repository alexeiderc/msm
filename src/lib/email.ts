import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOrderReceipt(params: {
  to: string;
  orderNumber: string;
  total: string;
}) {
  if (!resend) {
    return { skipped: true, reason: "RESEND_API_KEY is not configured" };
  }

  return resend.emails.send({
    from: "MSM my store <orders@msmmystore.com>",
    to: params.to,
    subject: `Factura digital ${params.orderNumber}`,
    html: `<p>Tu orden ${params.orderNumber} fue registrada por ${params.total}.</p>`
  });
}
