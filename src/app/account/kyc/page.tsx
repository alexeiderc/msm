import Link from "next/link";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { CustomerKycForm } from "@/components/forms/customer-kyc-form";
import { IdswyftKycButton } from "@/components/forms/idswyft-kyc-button";
import { isIdswyftConfigured } from "@/lib/idswyft/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";

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

function StatusHero({ kycStatus, profile }: { kycStatus: string | null | undefined; profile: { identity_document_last4?: string | null; identity_document_type?: string | null } | null | undefined }) {
  if (kycStatus === "aprobado") {
    return (
      <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-200">
          <CheckCircle2 size={36} className="text-green-700" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-green-800">KYC aprobado</h2>
        <p className="mt-2 text-green-700">Tu identidad fue verificada. Ya puedes operar sin restricciones en MSM.</p>
        <Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-green-700">
          Explorar productos <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (kycStatus === "rechazado") {
    return (
      <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-200">
          <XCircle size={36} className="text-red-700" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-red-800">KYC rechazado</h2>
        <p className="mt-2 text-red-700">No pudimos verificar tu identidad con la informacion proporcionada.</p>
        <p className="mt-1 text-sm text-red-600">Vuelve a intentar con un documento valido y buena iluminacion.</p>
      </div>
    );
  }

  if (kycStatus === "requiere_revision") {
    return (
      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-200">
          <Clock size={36} className="text-amber-700" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-amber-800">KYC en revision</h2>
        <p className="mt-2 text-amber-700">Tu informacion esta siendo revisada por el equipo MSM.</p>
        <p className="mt-1 text-sm text-amber-600">Te notificaremos cuando el proceso este completo.</p>
        {profile?.identity_document_last4 && (
          <div className="mx-auto mt-4 inline-flex items-center gap-3 rounded-lg border border-amber-300 bg-white/70 px-4 py-2 text-sm text-amber-800">
            <ShieldCheck size={16} />
            Documento terminado en {profile.identity_document_last4}
            {profile.identity_document_type ? ` (${profile.identity_document_type})` : ""}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default async function CustomerKycPage() {
  const { profile } = await getProfile();
  const idswyftAvailable = isIdswyftConfigured();
  const kycStatus = profile?.customer_kyc_status;

  return (
    <AppShell>
      <section className="mx-auto grid max-w-2xl gap-6 px-4 py-8 pb-24">
        <div className="text-center">
          <Badge>Seguridad MSM</Badge>
          <h1 className="mt-3 text-3xl font-black text-msm-ink">Validacion del cliente</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            MSM utiliza estos datos para proteger tu cuenta, prevenir fraudes y garantizar entregas seguras.
          </p>
        </div>

        <StatusHero kycStatus={kycStatus} profile={profile} />

        {(!kycStatus || kycStatus === "pendiente") && idswyftAvailable && (
          <IdswyftKycButton kycStatus={kycStatus} />
        )}

        {(!kycStatus || kycStatus === "pendiente" || kycStatus === "rechazado") && (
          <>
            <div className="rounded-xl border border-msm-line bg-white p-5 shadow-soft">
              <h2 className="flex items-center gap-2 text-lg font-bold text-msm-ink">
                <ShieldCheck size={20} className="text-msm-blue" />
                Estado actual
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</span>
                  <p className="mt-1 text-lg font-bold text-msm-ink">{kycStatus ?? "pendiente"}</p>
                </div>
                <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Riesgo</span>
                  <p className="mt-1 text-lg font-bold text-msm-ink">{profile?.customer_risk_level ?? "normal"}</p>
                </div>
                <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Metodo de pago</span>
                  <p className="mt-1 text-lg font-bold text-msm-ink">{profile?.payment_method_valid ? "Validado" : "Pendiente"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-msm-line bg-white p-5 shadow-soft">
              <CustomerKycForm profile={profile} />
            </div>
          </>
        )}

        {kycStatus === "requiere_revision" && (
          <div className="rounded-xl border border-msm-line bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-bold text-msm-ink">
              <ShieldCheck size={20} className="text-msm-blue" />
              Estado actual
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</span>
                <p className="mt-1 text-lg font-bold text-amber-700">En revision</p>
              </div>
              <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Riesgo</span>
                <p className="mt-1 text-lg font-bold text-msm-ink">{profile?.customer_risk_level ?? "normal"}</p>
              </div>
              <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Metodo de pago</span>
                <p className="mt-1 text-lg font-bold text-msm-ink">{profile?.payment_method_valid ? "Validado" : "Pendiente"}</p>
              </div>
            </div>
          </div>
        )}

        {kycStatus === "aprobado" && (
          <div className="rounded-xl border border-msm-line bg-white p-5 shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-bold text-msm-ink">
              <ShieldCheck size={20} className="text-msm-blue" />
              Estado actual
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</span>
                <p className="mt-1 text-lg font-bold text-green-700">Aprobado</p>
              </div>
              <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Riesgo</span>
                <p className="mt-1 text-lg font-bold text-msm-ink">{profile?.customer_risk_level ?? "normal"}</p>
              </div>
              <div className="rounded-lg border border-msm-line bg-msm-cloud p-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Metodo de pago</span>
                <p className="mt-1 text-lg font-bold text-msm-ink">{profile?.payment_method_valid ? "Validado" : "Pendiente"}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
