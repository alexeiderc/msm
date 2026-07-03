"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { checkoutSchema, deliveryEvidenceSchema, orderStatusSchema } from "@/lib/validations";
import { calculateCustomerRisk } from "@/lib/risk/customer-risk";
import { makeOrderNumber } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notifyOrderCreated, notifyOrderStatusChange } from "@/lib/notifications";
import type { ActionResult } from "@/types/actions";

export type ActionState = ActionResult;

function normalizeName(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function createCheckoutOrder(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Inicia sesion para completar el checkout." };
  }

  const { data: customerProfile } = await admin
    .from("profiles")
    .select("full_name,email,phone,country,address,payment_method_valid,customer_kyc_status,customer_risk_level,identity_document_type,identity_document_last4,payment_account_owner,chargeback_policy_accepted_at")
    .eq("id", user.id)
    .maybeSingle();

  const customerReadyForCheckout = Boolean(
    customerProfile?.full_name &&
      customerProfile.phone &&
      customerProfile.country &&
      customerProfile.address &&
      customerProfile.identity_document_type &&
      customerProfile.identity_document_last4 &&
      customerProfile.payment_account_owner &&
      customerProfile.chargeback_policy_accepted_at
  );

  if (!customerReadyForCheckout) {
    return {
      ok: false,
      message:
        "Antes de pagar debes completar KYC de cliente y aceptar la politica contra contracargos en /account/kyc."
    };
  }

  if (customerProfile?.customer_kyc_status !== "aprobado") {
    return {
      ok: false,
      message:
        "Tu KYC debe estar aprobado para poder crear ordenes. Completalo en /account/kyc."
    };
  }

  const [{ count: pendingOrderCount }, { count: fraudAlertCount }] = await Promise.all([
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id)
      .in("status", ["pendiente_pago", "incidencia"]),
    admin
      .from("fraud_alerts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
  ]);
  const paymentOwnerMatches =
    normalizeName(customerProfile?.full_name) === normalizeName(customerProfile?.payment_account_owner) ||
    normalizeName(customerProfile?.full_name).includes(normalizeName(customerProfile?.payment_account_owner)) ||
    normalizeName(customerProfile?.payment_account_owner).includes(normalizeName(customerProfile?.full_name));
  const customerRisk = calculateCustomerRisk({
    kycStatus: customerProfile?.customer_kyc_status,
    riskLevel: customerProfile?.customer_risk_level,
    paymentMethodValid: customerProfile?.payment_method_valid,
    hasChargebackAcceptance: Boolean(customerProfile?.chargeback_policy_accepted_at),
    paymentOwnerMatches,
    pendingOrders: pendingOrderCount ?? 0,
    fraudAlerts: fraudAlertCount ?? 0
  });

  await admin
    .from("profiles")
    .update({
      customer_risk_score: customerRisk.score,
      customer_risk_level: customerRisk.level,
      customer_risk_reasons: customerRisk.reasons,
      customer_last_risk_review_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (customerRisk.level === "alto" || customerRisk.level === "bloqueado") {
    await admin.from("fraud_alerts").insert({
      user_id: user.id,
      type: "cliente_riesgo_checkout",
      severity: customerRisk.level === "bloqueado" ? "critica" : "alta",
      message: "Cliente con riesgo elevado intento crear una orden.",
      metadata: {
        score: customerRisk.score,
        level: customerRisk.level,
        reasons: customerRisk.reasons
      }
    });
  }

  if (
    customerProfile?.customer_kyc_status === "rechazado" ||
    customerProfile?.customer_risk_level === "bloqueado" ||
    customerRisk.level === "bloqueado"
  ) {
    await admin.from("fraud_alerts").insert({
      user_id: user.id,
      type: "cliente_kyc_bloqueado_checkout",
      severity: "alta",
      message: "Cliente con KYC rechazado o bloqueado intento crear una orden.",
      metadata: {
        customerKycStatus: customerProfile?.customer_kyc_status,
        customerRiskLevel: customerProfile?.customer_risk_level
      }
    });
    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "fraud.cliente_kyc_bloqueado_checkout",
      entity: "profiles",
      entity_id: user.id,
      after: {
        customerKycStatus: customerProfile?.customer_kyc_status,
        customerRiskLevel: customerProfile?.customer_risk_level
      }
    });
    return { ok: false, message: "Esta cuenta necesita revision de MSM antes de crear nuevas ordenes." };
  }

  const quantity = parsed.data.quantity || 1;
  let productQuery = admin
    .from("products")
    .select("id,name,price,stock,store_id,category_id,status,stores(seller_id,status,is_active,province,municipality),categories(base_commission)")
    .eq("is_active", true)
    .eq("status", "activo");

  productQuery = parsed.data.productId
    ? productQuery.eq("id", parsed.data.productId)
    : productQuery.order("created_at", { ascending: true }).limit(1);

  const { data: product, error: productError } = await productQuery.maybeSingle();

  if (productError) {
    return { ok: false, message: productError.message };
  }

  if (!product) {
    return {
      ok: false,
      message: "No hay producto activo para crear la orden. Publica uno desde el panel VIP o corre el seed."
    };
  }

  if (Number(product.stock) < quantity) {
    return { ok: false, message: "El producto no tiene stock suficiente." };
  }

  const productRelations = product as unknown as {
    stores?: { seller_id?: string; status?: string; is_active?: boolean; province?: string | null; municipality?: string | null } | { seller_id?: string; status?: string; is_active?: boolean; province?: string | null; municipality?: string | null }[];
    categories?: { base_commission?: number | string } | { base_commission?: number | string }[];
  };
  const productStore = Array.isArray(productRelations.stores) ? productRelations.stores[0] : productRelations.stores;

  if (!productStore?.seller_id || productStore.status !== "activo" || productStore.is_active !== true || !productStore.province || !productStore.municipality) {
    return { ok: false, message: "Este producto aun no esta disponible publicamente por vendedor, tienda o ubicacion." };
  }

  const sellerId = Array.isArray(productRelations.stores)
    ? productRelations.stores[0]?.seller_id
    : productRelations.stores?.seller_id;
  const commissionRate = Number(
    Array.isArray(productRelations.categories)
      ? productRelations.categories[0]?.base_commission
      : productRelations.categories?.base_commission ?? 6
  );
  const subtotal = Number((Number(product.price) * quantity).toFixed(2));
  const msmCommission = Number((subtotal * (commissionRate / 100)).toFixed(2));
  let gatewayCommission = 0;
  let account: { id: string; daily_limit?: number | string; received_today?: number | string; status?: string } | null = null;
  let walletBeforeBalance = 0;
  const paymentMode = parsed.data.paymentMode;

  if (paymentMode === "saldo_msm") {
    const { data: wallet } = await admin
      .from("wallet_accounts")
      .select("id,balance,status,risk_hold")
      .eq("user_id", user.id)
      .eq("currency", parsed.data.paymentCurrency)
      .maybeSingle();

    if (!wallet || wallet.status !== "activa" || wallet.risk_hold) {
      return { ok: false, message: "Tu Saldo MSM no esta activo para pagar. Revisa /wallet o contacta soporte." };
    }

    walletBeforeBalance = Number(wallet.balance ?? 0);
    if (walletBeforeBalance < subtotal) {
      return {
        ok: false,
        message: `Saldo MSM insuficiente. Tienes ${walletBeforeBalance.toFixed(2)} ${parsed.data.paymentCurrency} y necesitas ${subtotal.toFixed(2)}.`
      };
    }
  } else {
    if (!parsed.data.paymentMethodId) {
      return { ok: false, message: "Selecciona un metodo de pago manual o usa Saldo MSM." };
    }

    const { data: method } = await admin
      .from("payment_methods")
      .select("id,status,type,country,currency,fee_percent")
      .eq("id", parsed.data.paymentMethodId)
      .single();

    if (method?.status !== "activo") {
      await admin.from("fraud_alerts").insert({
        user_id: user.id,
        type: "metodo_pausado",
        severity: "alta",
        message: "El comprador intento crear una orden con un metodo no activo.",
        metadata: { paymentMethodId: parsed.data.paymentMethodId, status: method?.status }
      });
      await admin.from("audit_logs").insert({
        actor_id: user.id,
        action: "fraud.metodo_pausado",
        entity: "payment_methods",
        entity_id: parsed.data.paymentMethodId,
        after: { status: method?.status }
      });
      return { ok: false, message: "Este metodo de pago no esta disponible ahora." };
    }

    if (method.country !== parsed.data.paymentCountry || method.currency !== parsed.data.paymentCurrency) {
      await admin.from("fraud_alerts").insert({
        user_id: user.id,
        type: "pais_o_moneda_no_coincide",
        severity: "media",
        message: "El checkout intento usar un metodo con pais o moneda diferente a lo seleccionado.",
        metadata: {
          methodCountry: method.country,
          selectedCountry: parsed.data.paymentCountry,
          methodCurrency: method.currency,
          selectedCurrency: parsed.data.paymentCurrency
        }
      });
      await admin.from("audit_logs").insert({
        actor_id: user.id,
        action: "fraud.pais_o_moneda_no_coincide",
        entity: "payment_methods",
        entity_id: parsed.data.paymentMethodId,
        after: { country: parsed.data.paymentCountry, currency: parsed.data.paymentCurrency }
      });
      return { ok: false, message: "El pais o moneda no coincide con el metodo de pago elegido." };
    }

    gatewayCommission = Number((subtotal * (Number(method.fee_percent ?? 0) / 100)).toFixed(2));

    const { data: selectedAccount } = await admin
      .from("payment_accounts")
      .select("id,daily_limit,received_today,status")
      .eq("method_id", parsed.data.paymentMethodId)
      .eq("status", "activa")
      .order("received_today", { ascending: true })
      .limit(1)
      .maybeSingle();

    account = selectedAccount;

    if (account && Number(account.received_today) + subtotal > Number(account.daily_limit)) {
      await admin.from("fraud_alerts").insert({
        user_id: user.id,
        type: "cuenta_supera_capacidad_diaria",
        severity: "media",
        message: "La cuenta de pago disponible superaria su limite diario.",
        metadata: { accountId: account.id, subtotal, receivedToday: account.received_today }
      });
      await admin.from("audit_logs").insert({
        actor_id: user.id,
        action: "fraud.cuenta_supera_capacidad_diaria",
        entity: "payment_accounts",
        entity_id: account.id,
        after: { subtotal, receivedToday: account.received_today }
      });
    }
  }

  const orderNumber = makeOrderNumber();
  const sellerNet = Number((subtotal - msmCommission - gatewayCommission).toFixed(2));

  const { data: seller } = sellerId
    ? await admin.from("sellers").select("max_confirm_minutes").eq("id", sellerId).maybeSingle()
    : { data: null };
  const vipConfirmBy = new Date(Date.now() + Number(seller?.max_confirm_minutes ?? 120) * 60_000).toISOString();
  let provinceId = parsed.data.provinceId;
  let municipalityId = parsed.data.municipalityId;

  const { data: provinceExists } = await admin
    .from("provinces")
    .select("id")
    .eq("id", provinceId)
    .maybeSingle();

  if (!provinceExists) {
    const requestedProvinceName = parsed.data.receiverProvinceName || "Santiago de Cuba";
    const requestedMunicipalityName = parsed.data.receiverMunicipalityName || "Segundo Frente";
    const { data: fallbackProvince } = await admin
      .from("provinces")
      .select("id")
      .eq("name", requestedProvinceName)
      .maybeSingle();

    let fallbackMunicipalityId: string | null = null;

    if (fallbackProvince?.id) {
      const { data: exactMunicipality } = await admin
        .from("municipalities")
        .select("id")
        .eq("province_id", fallbackProvince.id)
        .eq("name", requestedMunicipalityName)
        .maybeSingle();

      fallbackMunicipalityId = exactMunicipality?.id ?? null;
    }

    const { data: fallbackMunicipality } = fallbackProvince && !fallbackMunicipalityId
      ? await admin
          .from("municipalities")
          .select("id")
          .eq("province_id", fallbackProvince.id)
          .order("name", { ascending: true })
          .limit(1)
          .maybeSingle()
      : { data: null };

    if (fallbackProvince?.id && (fallbackMunicipalityId || fallbackMunicipality?.id)) {
      provinceId = fallbackProvince.id;
      municipalityId = fallbackMunicipalityId ?? fallbackMunicipality?.id;
    }
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: user.id,
      seller_id: sellerId ?? null,
      store_id: product.store_id,
      customer_risk_score: customerRisk.score,
      customer_risk_level: customerRisk.level,
      customer_risk_reasons: customerRisk.reasons,
      receiver_full_name: parsed.data.receiverFullName,
      receiver_phone: parsed.data.receiverPhone,
      province_id: provinceId,
      municipality_id: municipalityId,
      address: parsed.data.address,
      references: parsed.data.references,
      delivery_window: parsed.data.deliveryWindow,
      note: parsed.data.note,
      subtotal,
      msm_commission: msmCommission,
      gateway_commission: gatewayCommission,
      seller_net: sellerNet,
      status: paymentMode === "saldo_msm" ? "pago_confirmado" : "pendiente_pago",
      payment_country: parsed.data.paymentCountry,
      payment_currency: parsed.data.paymentCurrency,
      payment_method_id: paymentMode === "manual" ? parsed.data.paymentMethodId : null,
      payment_account_id: account?.id ?? null,
      payment_mode: paymentMode,
      vip_confirm_by: vipConfirmBy,
      vip_delivery_unlocked_at: paymentMode === "saldo_msm" ? new Date().toISOString() : null,
      legal_accepted_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  await admin.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    name: product.name,
    quantity,
    unit_price: Number(product.price),
    total: subtotal
  });

  await admin
    .from("products")
    .update({ stock: Math.max(Number(product.stock) - quantity, 0), updated_at: new Date().toISOString() })
    .eq("id", product.id);

  await admin.from("terms_acceptances").insert({
    order_id: order.id,
    user_id: user.id,
    version: "checkout-2026-06"
  });

  await admin.from("order_events").insert({
    order_id: order?.id,
    status: paymentMode === "saldo_msm" ? "pago_confirmado" : "pendiente_pago",
    actor_id: user.id,
      note: paymentMode === "saldo_msm"
        ? "Orden pagada con Saldo MSM desde checkout publico."
        : "Orden creada desde checkout publico.",
      metadata: {
        productId: product.id,
        paymentMode,
        paymentMethodId: paymentMode === "manual" ? parsed.data.paymentMethodId : null,
        paymentAccountId: account?.id ?? null,
        customerRisk
      }
  });

  if (paymentMode === "saldo_msm") {
    const { data: wallet } = await admin
      .from("wallet_accounts")
      .select("id,balance")
      .eq("user_id", user.id)
      .eq("currency", parsed.data.paymentCurrency)
      .maybeSingle();

    if (wallet) {
      const nextBalance = Number(wallet.balance ?? walletBeforeBalance) - subtotal;
      await admin
        .from("wallet_accounts")
        .update({ balance: Number(nextBalance.toFixed(2)), updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

      const { data: walletTransaction } = await admin
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          user_id: user.id,
          type: "debito",
          status: "confirmado",
          amount: subtotal,
          currency: parsed.data.paymentCurrency,
          reference_type: "order",
          reference_id: order.id,
          note: `Pago con Saldo MSM para orden ${orderNumber}`,
          metadata: { orderNumber, sellerId, storeId: product.store_id }
        })
        .select("id")
        .single();

      if (walletTransaction?.id) {
        await admin.from("orders").update({ wallet_transaction_id: walletTransaction.id }).eq("id", order.id);
      }

      await admin.from("wallet_score_events").insert({
        user_id: user.id,
        source: "saldo_msm",
        event_type: "compra_pagada",
        points: 2,
        metadata: { orderId: order.id, orderNumber, amount: subtotal }
      });
    }
  }

  revalidatePath("/orders");
  revalidatePath("/dashboard/economic");
  revalidatePath("/dashboard/vip");

  notifyOrderCreated({
    orderNumber,
    customerEmail: customerProfile?.email,
    customerPhone: customerProfile?.phone,
    userId: user.id,
    orderId: order.id
  });

  return {
    ok: true,
    message: paymentMode === "saldo_msm"
      ? "Orden creada y pagada con Saldo MSM. El VIP ya puede confirmar disponibilidad."
      : "Orden creada. Pendiente de confirmacion de pago.",
    orderNumber
  };
}

export async function updateVipOrderStatus(formData: FormData) {
  const parsed = orderStatusSchema.parse(Object.fromEntries(formData.entries()));
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Sesion requerida.");

  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.status, updated_at: new Date().toISOString() })
    .eq("id", parsed.orderId);

  if (error) throw new Error(error.message);

  await supabase.from("order_events").insert({
    order_id: parsed.orderId,
    status: parsed.status,
    actor_id: user.id,
    note: parsed.note
  });

  revalidatePath("/dashboard/vip");
}

export async function updateVipOrderStatusAction(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = orderStatusSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Estado invalido." };
  }

  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Sesion requerida." };
    }

    const { data: actorProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const isAdmin = ["administrador", "administrador_economico", "superadmin"].includes(actorProfile?.role ?? "");
    let seller: { id?: string } | null = null;
    if (!isAdmin) {
      const { data } = await admin.from("sellers").select("id").eq("profile_id", user.id).maybeSingle();
      seller = data;
    }
    const { data: order } = await admin
      .from("orders")
      .select("id,seller_id,status,customer_risk_level")
      .eq("id", parsed.data.orderId)
      .maybeSingle();

    if (!order) {
      return { ok: false, message: "No encontramos esa orden." };
    }

    if (!isAdmin && order.seller_id !== seller?.id) {
      return { ok: false, message: "Esta orden no pertenece a tu perfil VIP." };
    }

    if (parsed.data.status === "entregada") {
      return { ok: false, message: "Para marcar entregada debes subir evidencia y OTP desde Evidencia de entrega." };
    }

    if (order.status === "pendiente_pago") {
      return {
        ok: false,
        message: "La entrega esta bloqueada: Economia aun no ha aprobado el pago."
      };
    }

    if (order.customer_risk_level === "bloqueado" && !isAdmin) {
      return { ok: false, message: "Cuenta del cliente bloqueada. Solo administracion puede operar esta orden." };
    }

    const allowedFromPaid = ["pago_confirmado", "asignada_vip", "confirmada_vip", "preparando", "en_ruta", "incidencia"];
    if (!allowedFromPaid.includes(order.status)) {
      return { ok: false, message: `La orden no permite accion VIP desde estado ${order.status}.` };
    }

    const { error } = await admin
      .from("orders")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", parsed.data.orderId);

    if (error) {
      return { ok: false, message: error.message };
    }

    await admin.from("order_events").insert({
      order_id: parsed.data.orderId,
      status: parsed.data.status,
      actor_id: user.id,
      note: parsed.data.note
    });

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "order.status_update",
      entity: "orders",
      entity_id: parsed.data.orderId,
      after: { status: parsed.data.status, note: parsed.data.note }
    });

    let orderForNotify: { order_number: string; customer_id: string; profiles?: { email?: string; phone?: string } | { email?: string; phone?: string }[] } | null = null;
    try {
      const result = await admin
        .from("orders")
        .select("order_number,customer_id,profiles!inner(email,phone)")
        .eq("id", parsed.data.orderId)
        .maybeSingle();
      orderForNotify = result.data;
    } catch {}
    if (orderForNotify) {
      const row = orderForNotify as unknown as {
        order_number: string;
        customer_id: string;
        profiles?: { email?: string; phone?: string } | { email?: string; phone?: string }[];
      };
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      notifyOrderStatusChange({
        orderNumber: row.order_number,
        status: parsed.data.status,
        customerEmail: profile?.email,
        customerPhone: profile?.phone,
        userId: row.customer_id,
        orderId: parsed.data.orderId
      });
    }

    revalidatePath("/dashboard/vip");
    revalidatePath("/orders");
    return { ok: true, message: `Orden actualizada a ${parsed.data.status}.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo actualizar la orden." };
  }
}

export async function submitDeliveryEvidence(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = deliveryEvidenceSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Evidencia invalida." };
  }

  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Sesion requerida." };
    }

    const { data: actorProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const isAdmin = ["administrador", "administrador_economico", "superadmin"].includes(actorProfile?.role ?? "");
    let seller: { id?: string } | null = null;
    if (!isAdmin) {
      const { data } = await admin.from("sellers").select("id").eq("profile_id", user.id).maybeSingle();
      seller = data;
    }
    const { data: order } = await admin
      .from("orders")
      .select("id,seller_id,status,delivery_otp_code_hash,delivery_otp_required,customer_risk_level")
      .eq("id", parsed.data.orderId)
      .maybeSingle();

    if (!order) {
      return { ok: false, message: "No encontramos esa orden." };
    }

    if (!isAdmin && order.seller_id !== seller?.id) {
      return { ok: false, message: "Esta orden no pertenece a tu perfil VIP." };
    }

    if (order.status === "pendiente_pago") {
      return { ok: false, message: "No puedes entregar: Economia aun no aprobo el pago." };
    }

    if (order.customer_risk_level === "bloqueado" && !isAdmin) {
      return { ok: false, message: "Cliente bloqueado. Administracion debe revisar antes de entregar." };
    }

    const otpCodeHash = parsed.data.otpCode
      ? createHash("sha256").update(parsed.data.otpCode).digest("hex")
      : null;
    const otpVerified = Boolean(order.delivery_otp_code_hash && otpCodeHash === order.delivery_otp_code_hash);

    if (order.delivery_otp_required && order.delivery_otp_code_hash && !otpVerified) {
      return { ok: false, message: "OTP incorrecto o faltante. No se puede cerrar la entrega." };
    }

    if (!parsed.data.photoUrl && !parsed.data.signatureUrl && !otpVerified) {
      return { ok: false, message: "Agrega foto, firma o OTP verificado para cerrar entrega." };
    }

    const evidenceQualityScore =
      (parsed.data.photoUrl ? 30 : 0) +
      (parsed.data.signatureUrl ? 25 : 0) +
      (otpVerified ? 35 : 0) +
      (parsed.data.receiverName ? 5 : 0) +
      (parsed.data.receiverDocumentLast4 ? 5 : 0);

    const { error } = await admin.from("delivery_evidence").insert({
      order_id: parsed.data.orderId,
      photo_url: parsed.data.photoUrl || null,
      signature_url: parsed.data.signatureUrl || null,
      receiver_name: parsed.data.receiverName || null,
      receiver_document_last4: parsed.data.receiverDocumentLast4 || null,
      message: parsed.data.message || null,
      otp_code_hash: otpCodeHash,
      otp_verified: otpVerified,
      evidence_quality_score: evidenceQualityScore
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    await admin
      .from("orders")
      .update({
        status: "entregada",
        delivery_otp_verified_at: otpVerified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", parsed.data.orderId);

    await admin.from("order_events").insert({
      order_id: parsed.data.orderId,
      status: "entregada",
      actor_id: user.id,
      note: parsed.data.message || "Evidencia de entrega registrada."
    });

    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "delivery.evidence_uploaded",
      entity: "delivery_evidence",
      entity_id: parsed.data.orderId,
      after: {
        hasPhoto: Boolean(parsed.data.photoUrl),
        hasSignature: Boolean(parsed.data.signatureUrl),
        hasOtp: Boolean(parsed.data.otpCode),
        otpVerified,
        evidenceQualityScore,
        receiverName: parsed.data.receiverName || null
      }
    });

    let deliveredOrder: { order_number: string; customer_id: string; profiles?: { email?: string; phone?: string } | { email?: string; phone?: string }[] } | null = null;
    try {
      const result = await admin
        .from("orders")
        .select("order_number,customer_id,profiles!inner(email,phone)")
        .eq("id", parsed.data.orderId)
        .maybeSingle();
      deliveredOrder = result.data;
    } catch {}
    if (deliveredOrder) {
      const row = deliveredOrder as unknown as {
        order_number: string;
        customer_id: string;
        profiles?: { email?: string; phone?: string } | { email?: string; phone?: string }[];
      };
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      notifyOrderStatusChange({
        orderNumber: row.order_number,
        status: "entregada",
        customerEmail: profile?.email,
        customerPhone: profile?.phone,
        userId: row.customer_id,
        orderId: parsed.data.orderId
      });
    }

  revalidatePath("/dashboard/vip");
  revalidatePath("/orders");
  return { ok: true, message: "Evidencia guardada y orden marcada como entregada." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo guardar la evidencia." };
  }
}

export async function createBatchCheckoutOrders(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const itemsJson = formData.get("cartItems");
  let items: { productId: string; quantity: number }[] = [];
  try {
    items = JSON.parse(itemsJson as string);
  } catch {
    return { ok: false, message: "Items del carrito invalidos." };
  }

  if (!items.length) {
    return { ok: false, message: "El carrito esta vacio." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Inicia sesion para completar el checkout." };

  const { data: customerProfile } = await admin
    .from("profiles")
    .select("full_name,email,phone,country,address,customer_kyc_status,customer_risk_level,identity_document_type,identity_document_last4,payment_account_owner,chargeback_policy_accepted_at")
    .eq("id", user.id)
    .maybeSingle();

  const customerReady = Boolean(
    customerProfile?.full_name && customerProfile?.phone && customerProfile?.country &&
    customerProfile?.address && customerProfile?.identity_document_type &&
    customerProfile?.identity_document_last4 && customerProfile?.payment_account_owner &&
    customerProfile?.chargeback_policy_accepted_at
  );
  if (!customerReady) {
    return { ok: false, message: "Antes de pagar debes completar KYC de cliente en /account/kyc." };
  }

  if (customerProfile?.customer_kyc_status !== "aprobado") {
    return { ok: false, message: "Tu KYC debe estar aprobado para poder crear ordenes. Completalo en /account/kyc." };
  }

  const orderNumbers: string[] = [];
  const errors: string[] = [];

  for (const item of items) {
    const { data: product } = await admin
      .from("products")
      .select("id,name,price,stock,store_id,category_id,status,is_active,stores(seller_id,status,is_active,province,municipality),categories(base_commission)")
      .eq("id", item.productId)
      .eq("is_active", true)
      .eq("status", "activo")
      .maybeSingle();

    if (!product || Number(product.stock) < item.quantity) {
      errors.push(`Producto ${item.productId}: sin stock disponible.`);
      continue;
    }

    const row = product as unknown as {
      stores?: { seller_id?: string; status?: string; is_active?: boolean; province?: string | null; municipality?: string | null };
      categories?: { base_commission?: number | string };
    };
    const productStore = Array.isArray(row.stores) ? row.stores[0] : row.stores;
    if (!productStore?.seller_id || productStore.status !== "activo" || !productStore.is_active) {
      errors.push(`Producto ${product.name}: tienda no disponible.`);
      continue;
    }

    const sellerId = productStore.seller_id;
    const commissionRate = Number(
      Array.isArray(row.categories) ? row.categories[0]?.base_commission : row.categories?.base_commission ?? 6
    );
    const quantity = item.quantity || 1;
    const subtotal = Number((Number(product.price) * quantity).toFixed(2));
    const orderNumber = makeOrderNumber();
    const msmCommission = Number((subtotal * (commissionRate / 100)).toFixed(2));

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: user.id,
        seller_id: sellerId,
        store_id: product.store_id,
        receiver_full_name: formData.get("receiverFullName") as string,
        receiver_phone: formData.get("receiverPhone") as string,
        province_id: formData.get("provinceId") as string,
        municipality_id: formData.get("municipalityId") as string,
        address: formData.get("address") as string,
        references: formData.get("references") as string,
        delivery_window: formData.get("deliveryWindow") as string,
        note: formData.get("note") as string || null,
        subtotal,
        msm_commission: msmCommission,
        gateway_commission: 0,
        seller_net: Number((subtotal - msmCommission).toFixed(2)),
        payment_country: formData.get("paymentCountry") as string,
        payment_currency: formData.get("paymentCurrency") as string,
        payment_method_id: formData.get("paymentMethodId") as string,
        legal_accepted_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) {
      errors.push(`Error al crear orden para ${product.name}: ${error.message}`);
      continue;
    }

    await admin.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      name: product.name,
      quantity,
      unit_price: Number(product.price),
      total: subtotal
    });

    await admin.from("products").update({ stock: Math.max(Number(product.stock) - quantity, 0) }).eq("id", product.id);
    await admin.from("terms_acceptances").insert({ order_id: order.id, user_id: user.id, version: "checkout-2026-06" });
    await admin.from("order_events").insert({
      order_id: order.id, status: "pendiente_pago", actor_id: user.id,
      note: "Orden creada desde carrito.",
      metadata: { productId: product.id, quantity }
    });

    notifyOrderCreated({
      orderNumber,
      customerEmail: customerProfile?.email,
      customerPhone: customerProfile?.phone,
      userId: user.id,
      orderId: order.id
    });

    orderNumbers.push(orderNumber);
  }

  revalidatePath("/orders");
  revalidatePath("/dashboard/economic");
  revalidatePath("/dashboard/vip");

  const summary = orderNumbers.length
    ? `Ordenes creadas: ${orderNumbers.join(", ")}.`
    : "No se pudo crear ninguna orden.";
  const errorSummary = errors.length ? ` Errores: ${errors.join("; ")}` : "";

  return { ok: orderNumbers.length > 0, message: summary + errorSummary, orderNumber: orderNumbers[0] };
}
