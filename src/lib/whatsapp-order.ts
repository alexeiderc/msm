export type WhatsAppOrderItem = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  store: string;
  slug: string;
};

export type WhatsAppOrderInput = {
  items: WhatsAppOrderItem[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryProvince: string;
  deliveryMunicipality: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  notes?: string;
};

/** Normalize phone to digits only and add Cuba country code when needed. */
export function normalizeWhatsAppDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  // Cuban mobile without country code (8 digits starting with 5)
  if (digits.length === 8 && digits.startsWith("5")) digits = `53${digits}`;
  // 10 digits starting with 5 → treat as missing 53
  if (digits.length === 10 && digits.startsWith("5")) digits = `53${digits}`;
  return digits;
}

export function buildWhatsAppOrderMessage(input: WhatsAppOrderInput, adminLink: string): string {
  const itemLines = input.items
    .map((item) => `• ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`)
    .join("\n");

  return [
    `🛒 *Nuevo pedido desde MSM MY STORE*`,
    ``,
    `*Cliente:* ${input.customerName}`,
    `*Teléfono:* ${input.customerPhone}`,
    input.customerEmail ? `*Email:* ${input.customerEmail}` : null,
    `*Dirección:* ${input.deliveryAddress}`,
    `*Provincia:* ${input.deliveryProvince}`,
    `*Municipio:* ${input.deliveryMunicipality}`,
    input.beneficiaryName ? `*Beneficiario:* ${input.beneficiaryName}` : null,
    input.beneficiaryPhone ? `*Tel. beneficiario:* ${input.beneficiaryPhone}` : null,
    input.notes ? `*Notas:* ${input.notes}` : null,
    ``,
    `*Productos:*`,
    itemLines,
    ``,
    `*Total:* $${input.totalAmount.toFixed(2)} USD`,
    ``,
    `*Link de seguimiento:*`,
    adminLink,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildWaMeLink(phone: string, message: string): string {
  const digits = normalizeWhatsAppDigits(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}
