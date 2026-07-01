"use server";

import { createHash, randomInt, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  paymentAccountSchema,
  paymentMethodSchema,
  paymentProofSchema,
  paymentReviewSchema
} from "@/lib/validations";
import { notifyPaymentProofReceived, notifyPaymentApproved } from "@/lib/notifications";
import type { ActionResult } from "@/types/actions";

async function writeFraudAlert(params: {
  orderId?: string;
  userId?: string;
  type: string;
  severity?: "baja" | "media" | "alta" | "critica";
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  await admin.from("fraud_alerts").insert({
    order_id: params.orderId,
    user_id: params.userId,
    type: params.type,
    severity: params.severity ?? "media",
    message: params.message,
    metadata: params.metadata
  });
  await admin.from("audit_logs").insert({
    actor_id: params.userId,
    action: `fraud.${params.type}`,
    entity: "fraud_alerts",
    entity_id: params.orderId,
    after: { message: params.message, metadata: params.metadata }
  });
}

async function uploadOrderProofFile(
  admin: ReturnType<typeof createAdminClient>,
  formData: FormData,
  fallbackUrl?: string
) {
  if (fallbackUrl) return fallbackUrl;

  const proofFile = formData.get("proofFile");

  if (!(proofFile instanceof File) || proofFile.size === 0) {
    return "";
  }

  if (!proofFile.type.startsWith("image/")) {
    throw new Error("El comprobante debe ser una imagen.");
  }

  const extension = proofFile.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const path = `orders/${randomUUID()}.${extension}`;
  const { error } = await admin.storage.from("payment-proofs").upload(path, proofFile, {
    contentType: proofFile.type,
    upsert: false
  });

  if (error) {
    throw new Error(`No se pudo subir el comprobante: ${error.message}`);
  }

  const { data } = admin.storage.from("payment-proofs").getPublicUrl(path);
  return data.publicUrl;
}

export async function createPaymentMethod(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = paymentMethodSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Metodo invalido." };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("payment_methods")
      .insert({
        country: parsed.data.country,
        currency: parsed.data.currency,
        type: parsed.data.type,
        status: parsed.data.status,
        min_amount: parsed.data.minAmount,
        max_amount: parsed.data.maxAmount,
        fee_percent: parsed.data.feePercent,
        visible_instructions: parsed.data.visibleInstructions,
        internal_instructions: parsed.data.internalInstructions,
        priority: parsed.data.priority,
        daily_capacity: parsed.data.dailyCapacity,
        responsible_economic_id: parsed.data.responsibleEconomicId || null
      })
      .select("id")
      .single();

    if (error) return { ok: false, message: error.message };
    revalidatePath("/dashboard/economic");
    revalidatePath("/payment-methods");
    return { ok: true, message: "Metodo de pago creado.", id: data.id };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo crear el metodo." };
  }
}

export async function createPaymentAccount(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = paymentAccountSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Cuenta invalida." };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("payment_accounts")
      .insert({
        method_id: parsed.data.methodId,
        visible_name: parsed.data.visibleName,
        internal_alias: parsed.data.internalAlias,
        daily_limit: parsed.data.dailyLimit,
        status: parsed.data.status,
        expires_at: parsed.data.expiresAt || null,
        internal_note: parsed.data.internalNote,
        usage_rules: parsed.data.usageRules ? { rules: parsed.data.usageRules } : null
      })
      .select("id")
      .single();

    if (error) return { ok: false, message: error.message };
    revalidatePath("/dashboard/economic");
    return { ok: true, message: "Cuenta rotativa registrada.", id: data.id };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo registrar la cuenta." };
  }
}

export async function submitPaymentProof(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = paymentProofSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Comprobante invalido." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Sesion requerida." };

  const { data: order } = await admin
    .from("orders")
    .select("id,customer_id,subtotal,payment_country,payment_currency,payment_method_id,payment_account_id")
    .eq("id", parsed.data.orderId)
    .single();

  if (!order || order.customer_id !== user.id) {
    return { ok: false, message: "No encontramos una orden tuya con ese ID." };
  }

  let imageUrl = "";
  try {
    imageUrl = await uploadOrderProofFile(admin, formData, parsed.data.imageUrl);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo subir el comprobante." };
  }

  if (!imageUrl) {
    return { ok: false, message: "Sube una imagen o pega una URL del comprobante." };
  }

  if (order?.subtotal && Number(order.subtotal) !== parsed.data.amount) {
    await writeFraudAlert({
      orderId: parsed.data.orderId,
      userId: user.id,
      type: "monto_no_coincide",
      severity: "alta",
      message: "El monto del comprobante no coincide con el total de la orden.",
      metadata: { expected: order.subtotal, received: parsed.data.amount }
    });
  }

  if (order?.payment_country && order.payment_country !== parsed.data.country) {
    await writeFraudAlert({
      orderId: parsed.data.orderId,
      userId: user.id,
      type: "pais_no_coincide",
      severity: "media",
      message: "El pais del comprobante no coincide con el pais de pago asignado.",
      metadata: { expected: order.payment_country, received: parsed.data.country }
    });
  }

  if (
    order?.payment_account_id &&
    parsed.data.paymentAccountId &&
    order.payment_account_id !== parsed.data.paymentAccountId
  ) {
    await writeFraudAlert({
      orderId: parsed.data.orderId,
      userId: user.id,
      type: "cuenta_anterior_o_no_asignada",
      severity: "critica",
      message: "El comprador intento pagar por una cuenta distinta a la asignada a la orden.",
      metadata: { assigned: order.payment_account_id, received: parsed.data.paymentAccountId }
    });
  }

  const fingerprint = `${parsed.data.reference}:${parsed.data.amount}:${parsed.data.currency}`.toLowerCase();
  const { data: repeated } = await admin
    .from("payment_proofs")
    .select("id")
    .eq("fingerprint", fingerprint)
    .limit(1);

  if (repeated?.length) {
    await writeFraudAlert({
      orderId: parsed.data.orderId,
      userId: user.id,
      type: "comprobante_repetido",
      severity: "alta",
      message: "Se detecto un comprobante con referencia, monto y moneda repetidos.",
      metadata: { fingerprint }
    });
  }

  const { error } = await admin.from("payment_proofs").insert({
    order_id: parsed.data.orderId,
    customer_id: user.id,
    payment_method_id: parsed.data.paymentMethodId,
    payment_account_id: parsed.data.paymentAccountId || null,
    image_url: imageUrl,
    reference: parsed.data.reference,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    country: parsed.data.country,
    sender_name: parsed.data.senderName,
    paid_at: parsed.data.paidAt,
    fingerprint,
    status: "recibido"
  });

  if (error) return { ok: false, message: error.message };
  await admin.from("order_events").insert({
    order_id: parsed.data.orderId,
    status: "pendiente_pago",
    actor_id: user.id,
    note: "Comprobante de pago recibido para revision economica.",
    metadata: { reference: parsed.data.reference, amount: parsed.data.amount, currency: parsed.data.currency }
  });

  let proofNotify: { order_number: string; customer_id: string; profiles?: { email?: string; phone?: string } | { email?: string; phone?: string }[] } | null = null;
  try {
    const result = await admin
      .from("orders")
      .select("order_number,customer_id,profiles!inner(email,phone)")
      .eq("id", parsed.data.orderId)
      .maybeSingle();
    proofNotify = result.data;
  } catch {}
  if (proofNotify) {
    const row = proofNotify as unknown as {
      order_number: string;
      customer_id: string;
      profiles?: { email?: string; phone?: string } | { email?: string; phone?: string }[];
    };
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    notifyPaymentProofReceived({
      orderNumber: row.order_number,
      customerEmail: profile?.email,
      customerPhone: profile?.phone,
      userId: row.customer_id,
      orderId: parsed.data.orderId
    });
  }

  revalidatePath("/dashboard/economic");
  revalidatePath("/orders");
  return { ok: true, message: "Comprobante recibido. Economia debe revisarlo." };
}

export async function reviewPaymentProof(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = paymentReviewSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revision invalida." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion requerida." };

  const { data: proof } = await admin
    .from("payment_proofs")
    .select("id,amount,reference,payment_account_id,payment_methods(type),orders(id,seller_id,subtotal,msm_commission,gateway_commission,seller_net,customer_risk_level,customer_risk_score)")
    .eq("id", parsed.data.proofId)
    .maybeSingle();

  if (!proof) {
    return { ok: false, message: "No encontramos ese comprobante." };
  }

  const { error } = await admin.from("payment_reviews").insert({
    proof_id: parsed.data.proofId,
    reviewer_id: user.id,
    decision: parsed.data.decision,
    note: parsed.data.note
  });
  if (error) return { ok: false, message: error.message };

  await admin.from("payment_proofs").update({ status: parsed.data.decision }).eq("id", parsed.data.proofId);

  if (parsed.data.decision === "aprobado") {
    const order = Array.isArray(proof.orders) ? proof.orders[0] : proof.orders;
    const method = Array.isArray(proof.payment_methods) ? proof.payment_methods[0] : proof.payment_methods;

    if (order?.customer_risk_level === "bloqueado") {
      await writeFraudAlert({
        orderId: parsed.data.orderId,
        userId: user.id,
        type: "economia_intento_aprobar_cliente_bloqueado",
        severity: "critica",
        message: "Economia intento aprobar pago de una orden con cliente bloqueado.",
        metadata: { customerRiskScore: order.customer_risk_score }
      });
      return { ok: false, message: "Cliente bloqueado. Administracion debe revisar antes de aprobar." };
    }

    const deliveryOtp = String(randomInt(100000, 999999));
    const deliveryOtpHash = createHash("sha256").update(deliveryOtp).digest("hex");

    await admin
      .from("orders")
      .update({
        status: "pago_confirmado",
        vip_delivery_unlocked_at: new Date().toISOString(),
        delivery_otp_code_hash: deliveryOtpHash,
        delivery_otp_required: true
      })
      .eq("id", parsed.data.orderId);
    await admin.from("order_events").insert({
      order_id: parsed.data.orderId,
      status: "pago_confirmado",
      actor_id: user.id,
      note: "Comprobante aprobado por area economica. Entrega VIP desbloqueada con OTP.",
      metadata: {
        deliveryOtpDemo: deliveryOtp,
        deliveryOtpNotice: "En produccion este codigo debe enviarse por canal seguro al cliente/receptor."
      }
    });

    await admin.from("payments").insert({
      order_id: parsed.data.orderId,
      provider: method?.type ?? "manual",
      provider_ref: proof.reference,
      amount: Number(proof.amount),
      status: "aprobado",
      receipt_internal: parsed.data.note ?? null
    });

    if (proof.payment_account_id) {
      const { data: account } = await admin
        .from("payment_accounts")
        .select("received_today")
        .eq("id", proof.payment_account_id)
        .maybeSingle();
      await admin
        .from("payment_accounts")
        .update({ received_today: Number(account?.received_today ?? 0) + Number(proof.amount) })
        .eq("id", proof.payment_account_id);
    }

    const { data: existingLedger } = await admin
      .from("ledger_entries")
      .select("id")
      .eq("order_id", parsed.data.orderId)
      .limit(1);

    if (order?.seller_id && !existingLedger?.length) {
      await admin.from("ledger_entries").insert([
        {
          seller_id: order.seller_id,
          type: "venta",
          amount: Number(order.subtotal),
          description: "Venta bruta aprobada por comprobante.",
          order_id: parsed.data.orderId
        },
        {
          seller_id: order.seller_id,
          type: "comision_msm",
          amount: -Number(order.msm_commission),
          description: "Comision MSM.",
          order_id: parsed.data.orderId
        },
        {
          seller_id: order.seller_id,
          type: "comision_pasarela",
          amount: -Number(order.gateway_commission),
          description: "Comision pasarela/metodo de pago.",
          order_id: parsed.data.orderId
        }
      ]);
    }
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "payment_proof.review",
    entity: "payment_proofs",
    entity_id: parsed.data.proofId,
    after: { decision: parsed.data.decision, orderId: parsed.data.orderId }
  });

  if (parsed.data.decision === "aprobado") {
    let approvedOrder: { order_number: string; customer_id: string; profiles?: { email?: string; phone?: string } | { email?: string; phone?: string }[] } | null = null;
    try {
      const result = await admin
        .from("orders")
        .select("order_number,customer_id,profiles!inner(email,phone)")
        .eq("id", parsed.data.orderId)
        .maybeSingle();
      approvedOrder = result.data;
    } catch {}
    if (approvedOrder) {
      const row = approvedOrder as unknown as {
        order_number: string;
        customer_id: string;
        profiles?: { email?: string; phone?: string } | { email?: string; phone?: string }[];
      };
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      notifyPaymentApproved({
        orderNumber: row.order_number,
        customerEmail: profile?.email,
        customerPhone: profile?.phone,
        userId: row.customer_id,
        orderId: parsed.data.orderId
      });
    }
  }

  revalidatePath("/dashboard/economic");
  revalidatePath("/dashboard/vip");
  revalidatePath("/dashboard/don-miguel");
  revalidatePath("/orders");
  return { ok: true, message: `Revision guardada: ${parsed.data.decision}.` };
}
