const IDSWYFT_API_URL = process.env.IDSWYFT_API_URL || "http://localhost:3000";
const IDSWYFT_API_KEY = process.env.IDSWYFT_API_KEY || "";

export type IdswyftSessionResult = {
  session_id: string;
  verification_url: string;
  expires_at: string;
};

export type IdswyftVerificationStatus =
  | "pending"
  | "processing"
  | "verified"
  | "failed"
  | "manual_review";

export type IdswyftVerificationResult = {
  status: IdswyftVerificationStatus;
  decision: "verified" | "failed" | "manual_review";
  scores: {
    document: number;
    liveness: number;
    face_match: number;
    cross_validation: number;
    tamper: number;
  };
  document: {
    type: string;
    country: string;
    number_last4: string;
    full_name: string;
    dob: string;
    expiry: string;
  };
  face: {
    match_score: number;
    liveness_score: number;
    anti_spoof_score: number;
  };
  fraud: {
    aml_hits: string[];
    sanctions_hits: string[];
    pep_hits: string[];
  };
};

export async function createIdswyftSession(userId: string, returnUrl: string): Promise<IdswyftSessionResult> {
  const res = await fetch(`${IDSWYFT_API_URL}/v2/verify/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": IDSWYFT_API_KEY,
    },
    body: JSON.stringify({
      customer_id: userId,
      return_to: returnUrl,
      document_types: ["PASSPORT", "DL", "ID"],
      callbacks: {
        webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/kyc/idswyft-webhook`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Idswyft session error: ${err}`);
  }

  return res.json();
}

export async function getIdswyftVerification(sessionId: string): Promise<IdswyftVerificationResult> {
  const res = await fetch(`${IDSWYFT_API_URL}/v2/verify/${sessionId}/result`, {
    headers: {
      "x-api-key": IDSWYFT_API_KEY,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Idswyft result error: ${err}`);
  }

  return res.json();
}

export function isIdswyftConfigured(): boolean {
  return Boolean(IDSWYFT_API_KEY && IDSWYFT_API_URL);
}
