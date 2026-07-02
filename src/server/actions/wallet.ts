"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { walletLoadRequestSchema, walletLoadReviewSchema } from "@/lib/validations";
import type { ActionResult } from "@/types/actions";

function makeLoadNumber() {
  return `MSM-SALDO-${Date.now().toString(36).toUpperCase()}`;
}

async function getSignedInUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function createWalletLoadRequest(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = walletLoadRequestSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos invalidos para cargar Saldo MSM." };
  }

  const user = await getSignedInUser();
  if (!user) return { ok: false, message: "Inicia sesion para cargar Saldo MSM." };

  const admin = createAdminClient();
  const loadNumber = makeLoadNumber();

  const { data: method } = parsed.data.paymentMethodId
    ? await admin
        .from("payment_methods")
        .select("id,status,country,currency,type")
        .eq("id", parsed.data.paymentMethodId)
        .maybeSingle()
    : { data: null };

  if (method && method.status !== "activo") {
    await admin.from("fraud_alerts").insert({
      user_id: user.id,
      type: "wallet_metodo_no_activo",
      severity: "media",
      message: "Cliente intento cargar Saldo MSM con metodo pausado u oculto.",
      metadata: { paymentMethodId: method.id, status: method.status }
    });
    return { ok: false, message: "Ese metodo no esta disponible ahora para cargar saldo." };
  }

  if (method && (method.country !== parsed.data.country || method.currency !== parsed.data.currency)) {
    await admin.from("fraud_alerts").insert({
      user_id: user.id,
      type: "wallet_pais_moneda_no_coincide",
      severity: "media",
      message: "La recarga de Saldo MSM no coincide con pais o moneda del metodo.",
      metadata: {
        methodCountry: method.country,
        methodCurrency: method.currency,
        selectedCountry: parsed.data.country,
        selectedCurrency: parsed.data.currency
      }
    });
    return { ok: false, message: "El pais o moneda no coincide con el metodo seleccionado." };
  }

  const { data: request, error } = await admin
    .from("wallet_load_requests")
    .insert({
      load_number: loadNumber,
      user_id: user.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      country: parsed.data.country,
      payment_method_id: parsed.data.paymentMethodId || null,
      payment_account_id: parsed.data.paymentAccountId || null,
      sender_name: parsed.data.senderName,
      reference: parsed.data.reference,
      proof_url: parsed.data.proofUrl || null,
      note: parsed.data.note || null,
      status: "pendiente_revision"
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: "wallet.load_requested",
    entity: "wallet_load_requests",
    entity_id: request.id,
    after: {
      loadNumber,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      country: parsed.data.country,
      paymentMethodId: parsed.data.paymentMethodId || null
    }
  });

  revalidatePath("/wallet");
  revalidatePath("/dashboard/economic");
  revalidatePath("/dashboard/economico");
  return { ok: true, message: `Solicitud ${loadNumber} creada. Economia debe revisar antes de acreditar Saldo MSM.` };
}

export async function reviewWalletLoadRequest(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = walletLoadReviewSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revision invalida." };
  }

  const user = await getSignedInUser();
  if (!user) return { ok: false, message: "Sesion requerida." };

  const admin = createAdminClient();
  const { data: reviewer } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (!["administrador_economico", "superadmin"].includes(reviewer?.role ?? "")) {
    return { ok: false, message: "Solo Economia o superadmin puede revisar cargas de Saldo MSM." };
  }

  const { data: request } = await admin
    .from("wallet_load_requests")
    .select("id,load_number,user_id,amount,currency,status")
    .eq("id", parsed.data.requestId)
    .maybeSingle();

  if (!request) return { ok: false, message: "No encontramos esa solicitud." };
  if (request.status === "aprobado") return { ok: false, message: "Esta solicitud ya fue aprobada." };

  const now = new Date().toISOString();
  const nextStatus = parsed.data.decision === "aprobado" ? "aprobado" : parsed.data.decision;

  const { error: updateError } = await admin
    .from("wallet_load_requests")
    .update({
      status: nextStatus,
      reviewed_by: user.id,
      reviewed_at: now,
      review_note: parsed.data.note || null,
      updated_at: now
    })
    .eq("id", request.id);

  if (updateError) return { ok: false, message: updateError.message };

  await admin.from("wallet_load_reviews").insert({
    request_id: request.id,
    reviewer_id: user.id,
    decision: parsed.data.decision,
    note: parsed.data.note || null
  });

  if (parsed.data.decision === "aprobado") {
    const { data: wallet } = await admin
      .from("wallet_accounts")
      .upsert(
        {
          user_id: request.user_id,
          currency: request.currency,
          updated_at: now
        },
        { onConflict: "user_id,currency" }
      )
      .select("id,balance")
      .single();

    if (!wallet) return { ok: false, message: "No se pudo abrir la cuenta de Saldo MSM." };

    const newBalance = Number(wallet.balance ?? 0) + Number(request.amount ?? 0);
    await admin.from("wallet_accounts").update({ balance: newBalance, updated_at: now }).eq("id", wallet.id);

    await admin.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: request.user_id,
      type: "credito",
      status: "confirmado",
      amount: request.amount,
      currency: request.currency,
      reference_type: "wallet_load_request",
      reference_id: request.id,
      note: `Carga aprobada ${request.load_number}`,
      metadata: { reviewerId: user.id, reviewNote: parsed.data.note || null }
    });

    await admin.from("wallet_score_events").insert({
      user_id: request.user_id,
      source: "saldo_msm",
      event_type: "carga_aprobada",
      points: 5,
      metadata: { requestId: request.id, loadNumber: request.load_number, amount: request.amount }
    });
  }

  await admin.from("audit_logs").insert({
    actor_id: user.id,
    action: `wallet.load_${parsed.data.decision}`,
    entity: "wallet_load_requests",
    entity_id: request.id,
    after: {
      decision: parsed.data.decision,
      amount: request.amount,
      currency: request.currency,
      note: parsed.data.note || null
    }
  });

  revalidatePath("/wallet");
  revalidatePath("/dashboard/economic");
  revalidatePath("/dashboard/economico");
  return { ok: true, message: `Solicitud ${request.load_number} actualizada: ${parsed.data.decision}.` };
}
