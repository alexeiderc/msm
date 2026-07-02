import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { IdswyftWebhookPayload } from "@/lib/idswyft/client";

const WEBHOOK_SECRET = process.env.IDSWYFT_WEBHOOK_SECRET;

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!WEBHOOK_SECRET || !signatureHeader) return false;
  const expected = `sha256=${crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("hex")}`;
  if (expected.length !== signatureHeader.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}

import crypto from "crypto";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const signatureHeader = request.headers.get("X-Idswyft-Signature");
  if (WEBHOOK_SECRET && !verifySignature(rawBody, signatureHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: IdswyftWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  const userId = payload.user_id;
  const status = payload.status;
  const ocrData = payload.data?.ocr_data;
  const faceMatchScore = payload.data?.face_match_score;

  const kycStatus = status === "verified" ? "aprobado" : status === "failed" ? "rechazado" : "requiere_revision";

  await admin.from("profiles").update({
    customer_kyc_status: kycStatus,
    kyc_provider: "idswyft",
    kyc_provider_reference: payload.verification_id,
    kyc_checked_at: new Date().toISOString(),
    identity_document_type: ocrData?.detected_document_type ?? null,
    identity_document_last4: ocrData?.document_number
      ? String(ocrData.document_number).slice(-4).toUpperCase()
      : null,
    account_hold_reason: status === "failed" ? (payload.data?.failure_reason ?? "KYC rechazado por Idswyft") : null,
  }).eq("id", userId);

  await admin.from("customer_kyc_reviews").insert({
    profile_id: userId,
    status: kycStatus,
    provider: "idswyft",
    provider_reference: payload.verification_id,
    decision_note: `Idswyft: ${status}${faceMatchScore ? ` | face_match=${Math.round(faceMatchScore * 100)}%` : ""}`,
    metadata: {
      idswyft_event: payload.event,
      idswyft_verification: payload.verification_id,
      ocr_data: ocrData,
      face_match_score: faceMatchScore,
      failure_reason: payload.data?.failure_reason,
    },
  });

  await admin.from("audit_logs").insert({
    actor_id: userId,
    action: `kyc.idswyft_${status}`,
    entity: "profiles",
    entity_id: userId,
    after: { kycStatus, provider: "idswyft", verificationId: payload.verification_id },
  });

  return NextResponse.json({ ok: true });
}
