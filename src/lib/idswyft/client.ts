const IDSWYFT_API_URL = process.env.IDSWYFT_API_URL || "http://localhost:3000";
const IDSWYFT_API_KEY = process.env.IDSWYFT_API_KEY || "";

// La pagina de verificacion hosted de Idswyft esta en un dominio distinto a la API
const IDSWYFT_FRONTEND_URL = process.env.IDSWYFT_FRONTEND_URL || "https://www.idswyft.app";

export type IdswyftSessionResult = {
  verification_id: string;
  verification_url: string;
  session_token: string;
};

export type IdswyftVerificationStatus =
  | "pending"
  | "processing"
  | "verified"
  | "failed"
  | "manual_review";

export type IdswyftWebhookPayload = {
  event?: string;
  user_id: string;
  verification_id: string;
  status: IdswyftVerificationStatus;
  timestamp: string;
  data?: {
    ocr_data?: Record<string, unknown>;
    face_match_score?: number;
    failure_reason?: string;
    manual_review_reason?: string;
  };
};

export async function createIdswyftSession(userId: string, returnUrl: string): Promise<IdswyftSessionResult> {
  const res = await fetch(`${IDSWYFT_API_URL}/api/v2/verify/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": IDSWYFT_API_KEY,
    },
    body: JSON.stringify({
      user_id: userId,
      redirect_url: returnUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Idswyft session error: ${err}`);
  }

  const data = await res.json();
  return {
    verification_id: data.verification_id,
    session_token: data.session_token,
    verification_url: `${IDSWYFT_FRONTEND_URL}/user-verification?session=${data.session_token}`,
  };
}

export async function getIdswyftVerification(verificationId: string): Promise<{
  status: IdswyftVerificationStatus;
  data?: { ocr_data?: Record<string, unknown>; face_match_score?: number };
}> {
  const res = await fetch(`${IDSWYFT_API_URL}/api/v2/verify/${verificationId}/status`, {
    headers: {
      "X-API-Key": IDSWYFT_API_KEY,
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
