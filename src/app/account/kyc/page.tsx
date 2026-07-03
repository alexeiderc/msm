import Link from "next/link";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { CustomerKycForm } from "@/components/forms/customer-kyc-form";
import { IdswyftKycButton } from "@/components/forms/idswyft-kyc-button";
import { isIdswyftConfigured } from "@/lib/idswyft/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, ShieldCheck } from "lucide-react";

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
          <div className={"grid gap-2 rounded-md border p-3 text-sm " + (kycStatus === "aprobado" ? "border-green-200 bg-green-50" : kycStatus === "rechazado" ? "border-red-200 bg-red-50" : "border-blue-100 bg-blue-50")}>
            <span className="font-bold">Estado: {kycStatus ?? "pendiente"}</span>
            <span>Riesgo: {profile?.customer_risk_level ?? "normal"}</span>
            <span>Metodo de pago validado: {profile?.payment_method_valid ? "si" : "pendiente"}</span>
          </div>

          {kycStatus === "aprobado" ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
              <ShieldCheck size={48} className="mx-auto text-green-600" />
              <h3 className="mt-3 text-xl font-bold text-green-800">KYC aprobado</h3>
              <p className="mt-2 text-green-700">
                Tu identidad fue verificada exitosamente. Ya puedes realizar compras y operar sin restricciones.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
              >
                Ver productos <ArrowRight size={18} />
              </Link>
            </div>
          ) : idswyftAvailable ? (
            <IdswyftKycButton kycStatus={kycStatus} />
          ) : null}
        </div>

        {kycStatus !== "aprobado" && <CustomerKycForm profile={profile} />}
      </section>
    </AppShell>
  );
}
