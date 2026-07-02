import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { CustomerKycForm } from "@/components/forms/customer-kyc-form";
import { IdswyftKycButton } from "@/components/forms/idswyft-kyc-button";
import { isIdswyftConfigured } from "@/lib/idswyft/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

async function getProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { profile: null, userId: null };

    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("full_name,phone,country,address,payment_method_valid,customer_kyc_status,customer_risk_level,identity_document_type,identity_document_last4,payment_app_name,payment_account_owner,kyc_provider_reference,chargeback_policy_accepted_at")
      .eq("id", user.id)
      .maybeSingle();

    return { profile: data, userId: user.id };
  } catch {
    return { profile: null, userId: null };
  }
}

export default async function CustomerKycPage() {
  const { profile } = await getProfile();
  const idswyftAvailable = isIdswyftConfigured();
  const kycStatus = profile?.customer_kyc_status;

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
        </div>

        <div className="grid gap-3 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck size={20} className="text-msm-blue" />
              Estado KYC
            </h2>
          </div>
          <div className="grid gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm">
            <span className="font-bold">Estado: {kycStatus ?? "pendiente"}</span>
            <span>Riesgo: {profile?.customer_risk_level ?? "normal"}</span>
            <span>Metodo de pago validado: {profile?.payment_method_valid ? "si" : "pendiente"}</span>
          </div>

          {idswyftAvailable && <IdswyftKycButton kycStatus={kycStatus} />}
        </div>

        <CustomerKycForm profile={profile} />
      </section>
    </AppShell>
  );
}
