"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { queueWhatsAppMessage } from "@/lib/whatsapp";

type WhatsAppCartInput = {
  items: {
    productId: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
    store: string;
    slug: string;
  }[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryProvince: string;
  deliveryMunicipality: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
};

export async function sendWhatsAppCart(input: WhatsAppCartInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para enviar el carrito");

  const admin = createAdminClient();

  const { data: globalSetting } = await admin
    .from("settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();

  const defaultWhatsApp = globalSetting
    ? (globalSetting.value as { number: string }).number
    : "";

  if (!defaultWhatsApp) {
    throw new Error("El administrador aún no ha configurado el número de WhatsApp para recibir pedidos");
  }

  const cartId = crypto.randomUUID();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const adminLink = `${siteUrl}/dashboard/whatsapp-carts/${cartId}`;

  const itemLines = input.items
    .map((item) => `• ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`)
    .join("\n");

  const messageBody = [
    `🛒 *Nuevo pedido desde MSM my store*`,
    ``,
    `*Cliente:* ${input.customerName}`,
    `*Teléfono:* ${input.customerPhone}`,
    input.customerEmail ? `*Email:* ${input.customerEmail}` : null,
    `*Dirección:* ${input.deliveryAddress}`,
    `*Provincia:* ${input.deliveryProvince}`,
    `*Municipio:* ${input.deliveryMunicipality}`,
    input.beneficiaryName ? `*Beneficiario:* ${input.beneficiaryName}` : null,
    input.beneficiaryPhone ? `*Tel. beneficiario:* ${input.beneficiaryPhone}` : null,
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

  const { error: insertError } = await admin.from("whatsapp_carts").insert({
    id: cartId,
    user_id: user.id,
    items: input.items,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail ?? null,
    delivery_address: input.deliveryAddress,
    delivery_province: input.deliveryProvince,
    delivery_municipality: input.deliveryMunicipality,
    beneficiary_name: input.beneficiaryName ?? null,
    beneficiary_phone: input.beneficiaryPhone ?? null,
    total_amount: input.totalAmount,
    whatsapp_number: defaultWhatsApp,
    status: "enviado",
    admin_link: adminLink,
    admin_notes: messageBody,
  });

  if (insertError) throw new Error("Error al guardar el carrito: " + insertError.message);

  try {
    const msgResult = await queueWhatsAppMessage({
      to: defaultWhatsApp,
      template: "cart_received",
      variables: {
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        total: `$${input.totalAmount.toFixed(2)}`,
        link: adminLink,
      },
    });

    if (!msgResult.queued) {
      await admin
        .from("whatsapp_carts")
        .update({ admin_notes: `WhatsApp queue: ${msgResult.reason}` })
        .eq("id", cartId);
    }
  } catch {
    await admin
      .from("whatsapp_carts")
      .update({ admin_notes: "WhatsApp send failed, message queued for retry" })
      .eq("id", cartId);
  }

  return { cartId, adminLink };
}

export async function updateWhatsAppCartStatus(
  cartId: string,
  data: {
    status?: string;
    trackingCode?: string;
    feeAmount?: number;
    adminNotes?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const admin = createAdminClient();
  const updateData: Record<string, unknown> = {};

  if (data.status) updateData.status = data.status;
  if (data.trackingCode !== undefined) updateData.tracking_code = data.trackingCode;
  if (data.feeAmount !== undefined) updateData.fee_amount = data.feeAmount;
  if (data.adminNotes !== undefined) updateData.admin_notes = data.adminNotes;

  const { error } = await admin
    .from("whatsapp_carts")
    .update(updateData)
    .eq("id", cartId);

  if (error) throw new Error("Error al actualizar: " + error.message);

  return { success: true };
}

export async function getWhatsAppCart(cartId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_carts")
    .select("*")
    .eq("id", cartId)
    .maybeSingle();

  if (error || !data) return null;

  await admin
    .from("whatsapp_carts")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", cartId);

  return data;
}

export async function getUserWhatsAppCarts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("whatsapp_carts")
    .select("*")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function getAllWhatsAppCarts() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("whatsapp_carts")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function saveWhatsAppNumber(number: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: "No autorizado" };

  const admin = createAdminClient();

  // Primero intentar actualizar, si no existe hacer insert
  const { error: upsertError } = await admin
    .from("settings")
    .upsert({
      key: "whatsapp_number",
      value: { number },
      description: "Número de WhatsApp para recibir pedidos del carrito",
      updated_by: user.id,
    }, { onConflict: "key" });

  if (upsertError) {
    console.error("Upsert error:", upsertError);
    return { success: false, message: upsertError.message };
  }

  return { success: true };
}

export async function getWhatsAppNumber() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .maybeSingle();

  if (!data) return { number: "" };
  return data.value as { number: string };
}
