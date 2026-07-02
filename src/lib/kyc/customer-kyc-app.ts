import { createIdswyftSession, isIdswyftConfigured } from "@/lib/idswyft/client";

export type CustomerKycAppSession = {
  enabled: boolean;
  provider: string;
  url: string | null;
  verificationId?: string;
};

export async function getCustomerKycAppSession(userId?: string | null): Promise<CustomerKycAppSession> {
  const provider = process.env.KYC_CUSTOMER_PROVIDER || "manual_msm";

  if (isIdswyftConfigured() && userId) {
    try {
      const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account/kyc`;
      const session = await createIdswyftSession(userId, returnUrl);
      return {
        enabled: true,
        provider: "idswyft",
        url: session.verification_url,
        verificationId: session.verification_id,
      };
    } catch {
      return { enabled: false, provider: "idswyft_error", url: null };
    }
  }

  const baseUrl = process.env.KYC_CUSTOMER_APP_URL;
  if (!baseUrl || !userId) {
    return { enabled: false, provider, url: null };
  }

  const url = new URL(baseUrl);
  url.searchParams.set("customer_id", userId);
  url.searchParams.set("return_to", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/account/kyc");

  return { enabled: true, provider, url: url.toString() };
}
