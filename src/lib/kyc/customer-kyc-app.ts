export type CustomerKycAppSession = {
  enabled: boolean;
  provider: string;
  url: string | null;
};

export function getCustomerKycAppSession(userId?: string | null): CustomerKycAppSession {
  const provider = process.env.KYC_CUSTOMER_PROVIDER || "manual_msm";
  const baseUrl = process.env.KYC_CUSTOMER_APP_URL;

  if (!baseUrl || !userId) {
    return {
      enabled: false,
      provider,
      url: null
    };
  }

  const url = new URL(baseUrl);
  url.searchParams.set("customer_id", userId);
  url.searchParams.set("return_to", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/account/kyc");

  return {
    enabled: true,
    provider,
    url: url.toString()
  };
}
