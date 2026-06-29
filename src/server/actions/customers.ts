"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { customerKycSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function updateCustomerKyc(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = customerKycSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "KYC de cliente invalido." };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Debes iniciar sesion para guardar tu KYC." };
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("payment_method_valid")
    .eq("id", user.id)
    .maybeSingle();

  const normalizedFullName = normalizeName(parsed.data.fullName);
  const normalizedPaymentOwner = normalizeName(parsed.data.paymentAccountOwner);
  const paymentOwnerMatches =
    normalizedPaymentOwner === normalizedFullName ||
    normalizedFullName.includes(normalizedPaymentOwner) ||
    normalizedPaymentOwner.includes(normalizedFullName);
  const riskLevel = paymentOwnerMatches ? "normal" : "revision";
  const acceptedAt = new Date().toISOString();

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      country: parsed.data.country,
      address: parsed.data.address,
      payment_method_valid: Boolean(existingProfile?.payment_method_valid),
      customer_kyc_status: "requiere_revision",
      customer_risk_level: riskLevel,
      identity_document_type: parsed.data.identityDocumentType,
      identity_document_last4: parsed.data.identityDocumentLast4.toUpperCase(),
      payment_app_name: parsed.data.paymentAppName || null,
      payment_account_owner: parsed.data.paymentAccountOwner,
      kyc_provider: parsed.data.kycProviderReference ? "external_app" : "manual_msm",
      kyc_provider_reference: parsed.data.kycProviderReference || null,
      kyc_checked_at: null,
      chargeback_policy_accepted_at: acceptedAt,
      account_hold_reason: riskLevel === "revision" ? "Titular del pago no coincide exactamente con el cliente." : null
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  await admin.from("customer_kyc_reviews").insert({
    profile_id: user.id,
    status: "requiere_revision",
    risk_level: riskLevel,
    provider: parsed.data.kycProviderReference ? "external_app" : "manual_msm",
    provider_reference: parsed.data.kycProviderReference || null,
    decision_note: "KYC enviado por cliente. Pendiente de revision MSM o app externa.",
    metadata: {
      country: parsed.data.country,
      identityDocumentType: parsed.data.identityDocumentType,
      identityDocumentLast4: parsed.data.identityDocumentLast4.toUpperCase(),
      paymentAppName: parsed.data.paymentAppName || null,
      paymentAccountOwner: parsed.data.paymentAccountOwner,
      paymentOwnerMatches,
      chargebackPolicyAcceptedAt: acceptedAt,
      identityNote: parsed.data.identityNote || null
    }
  });

  if (!paymentOwnerMatches) {
    await admin.from("fraud_alerts").insert({
      user_id: user.id,
      type: "cliente_titular_pago_no_coincide",
      severity: "media",
      message: "El cliente declaro un titular de pago distinto o no coincidente con su nombre KYC.",
      metadata: {
        fullName: parsed.data.fullName,
        paymentAccountOwner: parsed.data.paymentAccountOwner,
        paymentAppName: parsed.data.paymentAppName || null
      }
    });
    await admin.from("audit_logs").insert({
      actor_id: user.id,
      action: "fraud.cliente_titular_pago_no_coincide",
      entity: "profiles",
      entity_id: user.id,
      after: {
        fullName: parsed.data.fullName,
        paymentAccountOwner: parsed.data.paymentAccountOwner,
        riskLevel
      }
    });
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "customer_kyc.update",
    entity: "profiles",
    entity_id: user.id,
    after: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      country: parsed.data.country,
      address: parsed.data.address,
      customerKycStatus: "requiere_revision",
      customerRiskLevel: riskLevel,
      identityDocumentType: parsed.data.identityDocumentType,
      identityDocumentLast4: parsed.data.identityDocumentLast4.toUpperCase(),
      paymentAppName: parsed.data.paymentAppName || null,
      paymentAccountOwner: parsed.data.paymentAccountOwner,
      kycProviderReference: parsed.data.kycProviderReference || null,
      chargebackPolicyAcceptedAt: acceptedAt,
      paymentMethodValid: Boolean(existingProfile?.payment_method_valid),
      identityNote: parsed.data.identityNote || null
    }
  });

  revalidatePath("/account/kyc");
  revalidatePath("/checkout");
  return {
    ok: true,
    message:
      riskLevel === "revision"
        ? "KYC guardado. Queda en revision porque el titular del pago no coincide exactamente con el cliente."
        : "KYC guardado. Queda pendiente de revision MSM o app externa antes de elevar confianza."
  };
}
