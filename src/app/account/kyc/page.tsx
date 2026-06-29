import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { CustomerKycForm } from "@/components/forms/customer-kyc-form";
import { getCustomerKycAppSession } from "@/lib/kyc/customer-kyc-app";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return { profile: null, kycApp: getCustomerKycAppSession(null) };

    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("full_name,phone,country,address,payment_method_valid,customer_kyc_status,customer_risk_level,identity_document_type,identity_document_last4,payment_app_name,payment_account_owner,kyc_provider_reference,chargeback_policy_accepted_at")
      .eq("id", user.id)
      .maybeSingle();

    return { profile: data, kycApp: getCustomerKycAppSession(user.id) };
  } catch {
    return { profile: null, kycApp: getCustomerKycAppSession(null) };
  }
}

export default async function CustomerKycPage() {
  const { profile, kycApp } = await getProfile();

  return (
    <AppShell>
      <section className="mx-auto grid max-w-3xl gap-5 px-4 py-6 pb-24">
        <div>
          <Badge>Cuenta MSM</Badge>
          <h1 className="mt-3 text-3xl font-bold">Validacion del cliente</h1>
          <p className="mt-2 text-slate-600">
            Guarda los datos que MSM usa para validar identidad, metodo de pago, trazabilidad de pedidos y
            proteccion contra contracargos o reclamaciones maliciosas.
          </p>
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-msm-ink">
            <p className="font-bold">App KYC cliente</p>
            {kycApp.enabled && kycApp.url ? (
              <a href={kycApp.url} className="mt-2 inline-flex font-bold text-msm-blue underline" target="_blank" rel="noreferrer">
                Abrir verificacion externa
              </a>
            ) : (
              <p className="mt-1">
                En localhost queda en modo manual MSM. En produccion se conecta con `KYC_CUSTOMER_APP_URL`
                para abrir una app externa de verificacion.
              </p>
            )}
          </div>
        </div>
        <CustomerKycForm profile={profile} />
      </section>
    </AppShell>
  );
}
