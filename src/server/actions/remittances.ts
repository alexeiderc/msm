"use server";

import { revalidatePath } from "next/cache";
import {
  remittancePaymentProofSchema,
  remittancePaymentReviewSchema,
  remittanceSchema,
  remittanceStatusSchema
} from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/actions";

function makeRemittanceNumber() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MSM-RM-${stamp}-${random}`;
}

async function uploadProofFile(
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
  const path = `remittances/${crypto.randomUUID()}.${extension}`;
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

async function writeRemittanceFraudAlert(
  admin: ReturnType<typeof createAdminClient>,
  params: {
    remittanceId?: string;
    userId?: string;
    type: string;
    severity?: "baja" | "media" | "alta" | "critica";
    message: string;
    metadata?: Record<string, unknown>;
  }
) {
  await admin.from("fraud_alerts").insert({
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
    entity_id: params.remittanceId,
    after: { message: params.message, metadata: params.metadata }
  });
}

export async function createRemittance(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = remittanceSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos de remesa invalidos." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Inicia sesion para crear una remesa." };
  }

  const { data: customerProfile } = await admin
    .from("profiles")
    .select("full_name,phone,country,address,customer_kyc_status,customer_risk_level,identity_document_type,identity_document_last4,payment_account_owner,chargeback_policy_accepted_at")
    .eq("id", user.id)
    .maybeSingle();

  const customerReadyForRemittance = Boolean(
    customerProfile?.full_name &&
      customerProfile.phone &&
      customerProfile.country &&
      customerProfile.address &&
      customerProfile.identity_document_type &&
      customerProfile.identity_document_last4 &&
      customerProfile.payment_account_owner &&
      customerProfile.chargeback_policy_accepted_at
  );

  if (!customerReadyForRemittance) {
    return {
      ok: false,
      message:
        "Antes de crear una remesa debes completar KYC de cliente y aceptar la politica contra contracargos en /account/kyc."
    };
  }

  if (customerProfile?.customer_kyc_status === "rechazado" || customerProfile?.customer_risk_level === "bloqueado") {
    await writeRemittanceFraudAlert(admin, {
      userId: user.id,
      type: "cliente_kyc_bloqueado_remesa",
      severity: "alta",
      message: "Cliente con KYC rechazado o bloqueado intento crear una remesa.",
      metadata: {
        customerKycStatus: customerProfile?.customer_kyc_status,
        customerRiskLevel: customerProfile?.customer_risk_level
      }
    });
    return { ok: false, message: "Esta cuenta necesita revision de MSM antes de crear remesas." };
  }

  const paymentMethodId = parsed.data.paymentMethodId;

  const { data: method, error: methodError } = await admin
    .from("payment_methods")
    .select("id,status,country,currency,fee_percent,type")
    .eq("id", paymentMethodId)
    .maybeSingle();

  if (methodError) {
    return { ok: false, message: methodError.message };
  }

  if (!method || method.status !== "activo") {
    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "remittance.payment_method_unavailable",
      entity: "payment_methods",
      entity_id: paymentMethodId,
      after: { status: method?.status ?? "missing" }
    });
    return { ok: false, message: "Metodo de pago no disponible para remesas ahora mismo." };
  }

  if (method.country !== parsed.data.senderCountry || method.currency !== parsed.data.senderCurrency) {
    await writeRemittanceFraudAlert(admin, {
      userId: user.id,
      type: "remesa_pais_o_moneda_no_coincide",
      severity: "media",
      message: "Remesa creada con pais o moneda diferente al metodo seleccionado.",
      metadata: {
        methodCountry: method.country,
        senderCountry: parsed.data.senderCountry,
        methodCurrency: method.currency,
        senderCurrency: parsed.data.senderCurrency
      }
    });
    return { ok: false, message: "El pais o moneda no coincide con el metodo de pago." };
  }

  const { data: account } = await admin
    .from("payment_accounts")
    .select("id,daily_limit,received_today,status")
    .eq("method_id", paymentMethodId)
    .eq("status", "activa")
    .order("received_today", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: vipStore } = await admin
    .from("stores")
    .select("id,seller_id,name,province,municipality,delivery_zones,remittance_municipalities,cash_available,remittance_daily_limit,remittance_eta")
    .eq("status", "activo")
    .eq("is_active", true)
    .eq("remittances_active", true)
    .contains("remittance_municipalities", [parsed.data.recipientMunicipality])
    .order("is_featured", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sendAmount = parsed.data.sendAmount;
  const msmFee = Number((sendAmount * (Number(method.fee_percent ?? 0) / 100)).toFixed(2));
  const netAmount = Number((sendAmount - msmFee).toFixed(2));

  if (account && Number(account.received_today) + sendAmount > Number(account.daily_limit)) {
    await writeRemittanceFraudAlert(admin, {
      userId: user.id,
      type: "remesa_cuenta_supera_capacidad_diaria",
      severity: "media",
      message: "La cuenta asignable para remesa superaria su limite diario.",
      metadata: { accountId: account.id, sendAmount, receivedToday: account.received_today }
    });
  }

  const remittanceNumber = makeRemittanceNumber();
  const { data: remittance, error } = await supabase
    .from("remittances")
    .insert({
      remittance_number: remittanceNumber,
      customer_id: user.id,
      sender_full_name: parsed.data.senderFullName,
      sender_phone: parsed.data.senderPhone,
      sender_country: parsed.data.senderCountry,
      sender_currency: parsed.data.senderCurrency,
      send_amount: sendAmount,
      msm_fee: msmFee,
      net_amount: netAmount,
      recipient_full_name: parsed.data.recipientFullName,
      recipient_phone: parsed.data.recipientPhone,
      recipient_province: parsed.data.recipientProvince,
      recipient_municipality: parsed.data.recipientMunicipality,
      recipient_address: parsed.data.recipientAddress,
      payout_currency: parsed.data.payoutCurrency,
      payout_method: parsed.data.payoutMethod,
      estimated_recipient_amount: null,
      assigned_seller_id: vipStore?.seller_id ?? null,
      vip_store_id: vipStore?.id ?? null,
      payment_method_id: paymentMethodId,
      payment_account_id: account?.id ?? null,
      note: parsed.data.note || null,
      legal_accepted_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  await admin.from("remittance_events").insert({
    remittance_id: remittance.id,
    status: "pendiente_pago",
    actor_id: user.id,
    note: "Remesa creada pendiente de pago y revision economica.",
    metadata: {
      paymentMethodId,
      paymentAccountId: account?.id ?? null,
      sendAmount,
      msmFee,
      netAmount,
      payoutMethod: parsed.data.payoutMethod,
      assignedSellerId: vipStore?.seller_id ?? null,
      vipStoreId: vipStore?.id ?? null,
      vipStoreName: vipStore?.name ?? null
    }
  });

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "remittance.create",
    entity: "remittances",
    entity_id: remittance.id,
    after: {
      remittanceNumber,
      status: "pendiente_pago",
      sendAmount,
      netAmount,
      payoutMethod: parsed.data.payoutMethod,
      assignedSellerId: vipStore?.seller_id ?? null,
      vipStoreId: vipStore?.id ?? null
    }
  });

  revalidatePath("/remittances");
  revalidatePath("/dashboard/economic");
  return {
    ok: true,
    message: "Remesa creada. Queda pendiente de pago y revision economica.",
    id: remittance.id,
    orderNumber: remittanceNumber
  };
}

export async function updateRemittanceStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = remittanceStatusSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Estado de remesa invalido." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion requerida." };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["administrador_economico", "administrador", "superadmin"].includes(profile.role)) {
    return { ok: false, message: "Solo economia o administracion puede operar remesas." };
  }

  const { data: before, error: readError } = await admin
    .from("remittances")
    .select("id,status,send_amount,payment_account_id,remittance_number")
    .eq("id", parsed.data.remittanceId)
    .maybeSingle();

  if (readError) {
    return { ok: false, message: readError.message };
  }

  if (!before) {
    return { ok: false, message: "No encontramos esa remesa." };
  }

  const { error } = await admin
    .from("remittances")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.remittanceId);

  if (error) {
    return { ok: false, message: error.message };
  }

  if (
    parsed.data.status === "pago_recibido" &&
    before.status !== "pago_recibido" &&
    before.payment_account_id
  ) {
    const { data: account } = await admin
      .from("payment_accounts")
      .select("received_today")
      .eq("id", before.payment_account_id)
      .maybeSingle();

    await admin
      .from("payment_accounts")
      .update({
        received_today: Number(account?.received_today ?? 0) + Number(before.send_amount ?? 0),
        updated_at: new Date().toISOString()
      })
      .eq("id", before.payment_account_id);
  }

  await admin.from("remittance_events").insert({
    remittance_id: parsed.data.remittanceId,
    status: parsed.data.status,
    actor_id: user.id,
    note: parsed.data.note || `Remesa actualizada a ${parsed.data.status}.`,
    metadata: {
      previousStatus: before.status,
      remittanceNumber: before.remittance_number
    }
  });

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "remittance.status_update",
    entity: "remittances",
    entity_id: parsed.data.remittanceId,
    before: { status: before.status },
    after: { status: parsed.data.status, note: parsed.data.note || null }
  });

  revalidatePath("/dashboard/economic");
  revalidatePath("/dashboard/don-miguel");
  revalidatePath("/remittances");
  return { ok: true, message: `Remesa ${before.remittance_number} actualizada a ${parsed.data.status}.` };
}

export async function submitRemittancePaymentProof(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = remittancePaymentProofSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Comprobante de remesa invalido." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion requerida." };
  }

  const { data: remittance, error: remittanceError } = await admin
    .from("remittances")
    .select("id,customer_id,send_amount,sender_country,sender_currency,payment_method_id,payment_account_id,remittance_number")
    .eq("id", parsed.data.remittanceId)
    .maybeSingle();

  if (remittanceError) {
    return { ok: false, message: remittanceError.message };
  }

  if (!remittance || remittance.customer_id !== user.id) {
    return { ok: false, message: "No encontramos una remesa tuya con ese ID." };
  }

  let imageUrl = "";
  try {
    imageUrl = await uploadProofFile(admin, formData, parsed.data.imageUrl);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo subir el comprobante." };
  }

  if (!imageUrl) {
    return { ok: false, message: "Sube una imagen o pega una URL del comprobante." };
  }

  if (Number(remittance.send_amount) !== parsed.data.amount) {
    await writeRemittanceFraudAlert(admin, {
      remittanceId: parsed.data.remittanceId,
      userId: user.id,
      type: "remesa_monto_no_coincide",
      severity: "alta",
      message: "El comprobante de remesa no coincide con el monto solicitado.",
      metadata: { expected: remittance.send_amount, received: parsed.data.amount, remittanceId: parsed.data.remittanceId }
    });
  }

  if (remittance.sender_country !== parsed.data.country || remittance.sender_currency !== parsed.data.currency) {
    await writeRemittanceFraudAlert(admin, {
      remittanceId: parsed.data.remittanceId,
      userId: user.id,
      type: "remesa_comprobante_pais_moneda_no_coincide",
      severity: "media",
      message: "El comprobante de remesa no coincide con pais o moneda de la remesa.",
      metadata: {
        expectedCountry: remittance.sender_country,
        receivedCountry: parsed.data.country,
        expectedCurrency: remittance.sender_currency,
        receivedCurrency: parsed.data.currency
      }
    });
  }

  if (remittance.payment_method_id !== parsed.data.paymentMethodId) {
    await writeRemittanceFraudAlert(admin, {
      remittanceId: parsed.data.remittanceId,
      userId: user.id,
      type: "remesa_metodo_no_asignado",
      severity: "critica",
      message: "El comprobante de remesa usa un metodo distinto al asignado.",
      metadata: { assigned: remittance.payment_method_id, received: parsed.data.paymentMethodId }
    });
  }

  if (
    remittance.payment_account_id &&
    parsed.data.paymentAccountId &&
    remittance.payment_account_id !== parsed.data.paymentAccountId
  ) {
    await writeRemittanceFraudAlert(admin, {
      remittanceId: parsed.data.remittanceId,
      userId: user.id,
      type: "remesa_cuenta_no_asignada",
      severity: "critica",
      message: "El comprobante de remesa usa una cuenta distinta a la asignada.",
      metadata: { assigned: remittance.payment_account_id, received: parsed.data.paymentAccountId }
    });
  }

  const fingerprint = `${parsed.data.reference}:${parsed.data.amount}:${parsed.data.currency}`.toLowerCase();
  const { data: repeated } = await admin
    .from("remittance_payment_proofs")
    .select("id")
    .eq("fingerprint", fingerprint)
    .limit(1);

  if (repeated?.length) {
    await writeRemittanceFraudAlert(admin, {
      remittanceId: parsed.data.remittanceId,
      userId: user.id,
      type: "remesa_comprobante_repetido",
      severity: "alta",
      message: "Se detecto un comprobante de remesa repetido.",
      metadata: { fingerprint }
    });
  }

  const { data: proof, error } = await admin
    .from("remittance_payment_proofs")
    .insert({
      remittance_id: parsed.data.remittanceId,
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
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  await admin.from("remittance_events").insert({
    remittance_id: parsed.data.remittanceId,
    status: "en_revision",
    actor_id: user.id,
    note: "Comprobante de remesa recibido para revision economica.",
    metadata: { proofId: proof.id, remittanceNumber: remittance.remittance_number }
  });

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "remittance_payment_proof.create",
    entity: "remittance_payment_proofs",
    entity_id: proof.id,
    after: { remittanceId: parsed.data.remittanceId, amount: parsed.data.amount, currency: parsed.data.currency }
  });

  revalidatePath("/dashboard/economic");
  revalidatePath("/remittances");
  return { ok: true, message: "Comprobante de remesa recibido. Economia debe revisarlo.", id: proof.id };
}

export async function reviewRemittancePaymentProof(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = remittancePaymentReviewSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revision de remesa invalida." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion requerida." };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["administrador_economico", "administrador", "superadmin"].includes(profile.role)) {
    return { ok: false, message: "Solo economia o administracion puede revisar comprobantes de remesa." };
  }

  const { data: proof, error: proofError } = await admin
    .from("remittance_payment_proofs")
    .select("id,amount,reference,payment_account_id,remittance_id")
    .eq("id", parsed.data.proofId)
    .maybeSingle();

  if (proofError) {
    return { ok: false, message: proofError.message };
  }

  if (!proof || proof.remittance_id !== parsed.data.remittanceId) {
    return { ok: false, message: "El comprobante no coincide con la remesa." };
  }

  const { error } = await admin.from("remittance_payment_reviews").insert({
    proof_id: parsed.data.proofId,
    reviewer_id: user.id,
    decision: parsed.data.decision,
    note: parsed.data.note || null
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await admin
    .from("remittance_payment_proofs")
    .update({ status: parsed.data.decision })
    .eq("id", parsed.data.proofId);

  if (parsed.data.decision === "aprobado") {
    await admin
      .from("remittances")
      .update({ status: "pago_recibido", updated_at: new Date().toISOString() })
      .eq("id", parsed.data.remittanceId);

    if (proof.payment_account_id) {
      const { data: account } = await admin
        .from("payment_accounts")
        .select("received_today")
        .eq("id", proof.payment_account_id)
        .maybeSingle();

      await admin
        .from("payment_accounts")
        .update({
          received_today: Number(account?.received_today ?? 0) + Number(proof.amount ?? 0),
          updated_at: new Date().toISOString()
        })
        .eq("id", proof.payment_account_id);
    }

    await admin.from("remittance_events").insert({
      remittance_id: parsed.data.remittanceId,
      status: "pago_recibido",
      actor_id: user.id,
      note: "Comprobante de remesa aprobado por economia.",
      metadata: { proofId: parsed.data.proofId, reference: proof.reference }
    });
  } else {
    await admin.from("remittance_events").insert({
      remittance_id: parsed.data.remittanceId,
      status: "en_revision",
      actor_id: user.id,
      note: `Comprobante de remesa revisado: ${parsed.data.decision}.`,
      metadata: { proofId: parsed.data.proofId, decision: parsed.data.decision }
    });
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "remittance_payment_proof.review",
    entity: "remittance_payment_proofs",
    entity_id: parsed.data.proofId,
    after: { remittanceId: parsed.data.remittanceId, decision: parsed.data.decision, note: parsed.data.note || null }
  });

  revalidatePath("/dashboard/economic");
  revalidatePath("/dashboard/don-miguel");
  revalidatePath("/remittances");
  return { ok: true, message: `Revision de remesa guardada: ${parsed.data.decision}.` };
}
