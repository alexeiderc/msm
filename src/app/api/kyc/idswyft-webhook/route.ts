import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const WEBHOOK_SECRET = process.env.IDSWYFT_WEBHOOK_SECRET;

type IdswyftWebhookPayload = {
  event: "verification.completed" | "verification.failed" | "verification.manual_review";
  session_id: string;
  customer_id: string;
  result: {
    status: string;
    decision: "verified" | "failed" | "manual_review";
    scores: Record<string, number>;
    document: {
      type: string;
      country: string;
      number_last4: string;
      full_name: string;
      dob?: string;
      expiry?: string;
    };
    face?: {
      match_score: number;
      liveness_score: number;
    };
    fraud?: {
      aml_hits?: string[];
      sanctions_hits?: string[];
      pep_hits?: string[];
    };
  };
  timestamp: string;
};

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-webhook-signature");
  if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: IdswyftWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  const userId = payload.customer_id;
  const decision = payload.result.decision;
  const scores = payload.result.scores;
  const document_ = payload.result.document;
  const fraud = payload.result.fraud;

  const kycStatus = decision === "verified" ? "aprobado" : decision === "failed" ? "rechazado" : "requiere_revision";
  const riskScore = Math.round(
    (1 - (scores?.document ?? 0)) * 30 +
    (1 - (scores?.face_match ?? scores?.liveness ?? 0)) * 40 +
    (fraud?.aml_hits?.length ?? 0 > 0 ? 30 : 0) +
    (fraud?.sanctions_hits?.length ?? 0 > 0 ? 50 : 0)
  );
  const riskLevel = riskScore >= 90 ? "bloqueado" : riskScore >= 70 ? "alto" : riskScore >= 35 ? "revision" : "normal";

  await admin.from("profiles").update({
    customer_kyc_status: kycStatus,
    customer_risk_level: riskLevel,
    customer_risk_score: riskScore,
    kyc_provider: "idswyft",
    kyc_provider_reference: payload.session_id,
    kyc_checked_at: new Date().toISOString(),
    identity_document_type: document_?.type ?? null,
    identity_document_last4: document_?.number_last4?.toUpperCase() ?? null,
    account_hold_reason: decision === "failed" ? "KYC rechazado por Idswyft" : null,
  }).eq("id", userId);

  await admin.from("customer_kyc_reviews").insert({
    profile_id: userId,
    status: kycStatus,
    risk_level: riskLevel,
    provider: "idswyft",
    provider_reference: payload.session_id,
    decision_note: `Idswyft: ${decision} | document=${Math.round((scores?.document ?? 0) * 100)}% face=${Math.round((scores?.face_match ?? scores?.liveness ?? 0) * 100)}%`,
    metadata: {
      idswyft_event: payload.event,
      idswyft_session: payload.session_id,
      scores,
      document: document_,
      fraud,
      riskScore,
      riskLevel,
    },
  });

  if (fraud?.aml_hits?.length ?? 0 > 0) {
    await admin.from("fraud_alerts").insert({
      user_id: userId,
      type: "aml_screening_hit",
      severity: "alta",
      message: `Idswyft AML screening hit: ${fraud!.aml_hits!.join(", ")}`,
      metadata: { aml_hits: fraud!.aml_hits, sanctions_hits: fraud!.sanctions_hits, pep_hits: fraud!.pep_hits },
    });
  }

  await admin.from("audit_logs").insert({
    actor_id: userId,
    action: `kyc.idswyft_${decision}`,
    entity: "profiles",
    entity_id: userId,
    after: { kycStatus, riskLevel, riskScore, provider: "idswyft", sessionId: payload.session_id },
  });

  return NextResponse.json({ ok: true });
}
