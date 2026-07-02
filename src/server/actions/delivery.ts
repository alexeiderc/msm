"use server";

import { randomInt, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { queueWhatsAppMessage } from "@/lib/whatsapp";

export async function generateDeliveryOtp(orderId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion requerida." };

  const { data: order } = await admin
    .from("orders")
    .select("id, seller_id, order_number, customer_id, profiles!inner(phone, full_name)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, message: "Orden no encontrada." };

  const { data: seller } = await admin.from("sellers").select("id").eq("profile_id", user.id).maybeSingle();
  const { data: actorProfile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = ["administrador", "superadmin"].includes(actorProfile?.role ?? "");

  if (!isAdmin && order.seller_id !== seller?.id) {
    return { ok: false, message: "Esta orden no te pertenece." };
  }

  const otp = String(randomInt(100000, 999999));
  const otpHash = createHash("sha256").update(otp).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { error } = await admin
    .from("orders")
    .update({
      delivery_otp_code_hash: otpHash,
      delivery_otp_required: true,
      vip_delivery_unlocked_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { ok: false, message: error.message };

  const customerPhone = (order as unknown as { profiles: { phone?: string } | { phone?: string }[] }).profiles;
  const phone = Array.isArray(customerPhone) ? customerPhone[0]?.phone : customerPhone?.phone;

  if (phone) {
    await queueWhatsAppMessage({
      to: phone,
      template: "delivery_otp",
      variables: { otp, orderNumber: order.order_number },
    });
  }

  await admin.from("order_events").insert({
    order_id: orderId,
    status: "en_ruta",
    actor_id: user.id,
    note: `OTP de entrega generado. Expira en 30 min.`,
    metadata: { otpGeneratedAt: new Date().toISOString(), otpExpiresAt: expiresAt },
  });

  revalidatePath("/dashboard/vip");
  revalidatePath(`/ordenes/${order.order_number}/comprobante`);
  return { ok: true, message: `OTP generado y enviado al cliente. Expiracion: 30 min.` };
}

export async function verifyDeliveryOtp(orderId: string, otpCode: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("delivery_otp_code_hash, delivery_otp_required, delivery_otp_verified_at")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false, message: "Orden no encontrada." };
  if (!order.delivery_otp_required) return { ok: false, message: "Esta orden no requiere OTP." };
  if (order.delivery_otp_verified_at) return { ok: false, message: "OTP ya fue verificado." };

  const otpHash = createHash("sha256").update(otpCode).digest("hex");
  if (otpHash !== order.delivery_otp_code_hash) {
    return { ok: false, message: "OTP incorrecto." };
  }

  await admin.from("orders").update({
    delivery_otp_verified_at: new Date().toISOString(),
  }).eq("id", orderId);

  return { ok: true, message: "OTP verificado correctamente." };
}
