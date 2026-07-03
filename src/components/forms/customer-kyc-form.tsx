"use client";

import { useActionState } from "react";
import { AlertTriangle, FileText, ShieldCheck, UserRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { updateCustomerKyc } from "@/server/actions/customers";
import { emptyActionResult } from "@/types/actions";

type CustomerKycFormProps = {
  profile?: {
    full_name?: string | null;
    phone?: string | null;
    country?: string | null;
    address?: string | null;
    payment_method_valid?: boolean | null;
    customer_kyc_status?: string | null;
    customer_risk_level?: string | null;
    identity_document_type?: string | null;
    identity_document_last4?: string | null;
    payment_app_name?: string | null;
    payment_account_owner?: string | null;
    kyc_provider_reference?: string | null;
    chargeback_policy_accepted_at?: string | null;
  } | null;
};

function SectionHeader({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string }) {
  return (
    <div className="col-span-full flex items-center gap-2 border-b border-msm-line pb-2">
      <Icon size={18} className="text-msm-blue" />
      <span className="text-sm font-bold uppercase tracking-wider text-slate-600">{label}</span>
    </div>
  );
}

export function CustomerKycForm({ profile }: CustomerKycFormProps) {
  const [state, formAction, pending] = useActionState(updateCustomerKyc, emptyActionResult);
  const isRejected = profile?.customer_kyc_status === "rechazado";

  return (
    <form action={formAction} className="grid gap-5">
      {isRejected && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
          <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={20} />
          <div>
            <p className="font-bold text-red-800">KYC rechazado anteriormente</p>
            <p className="mt-1 text-red-700">Corrige los datos y vuelve a enviar el formulario.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SectionHeader icon={UserRound} label="Datos personales" />
        <Input name="fullName" placeholder="Nombre completo legal" defaultValue={profile?.full_name ?? ""} required />
        <Input name="phone" placeholder="Telefono / WhatsApp" defaultValue={profile?.phone ?? ""} required />
        <Input name="country" placeholder="Pais donde resides" defaultValue={profile?.country ?? "Estados Unidos"} required />
        <div className="md:col-span-2">
          <Textarea
            name="address"
            placeholder="Direccion principal del comprador"
            defaultValue={profile?.address ?? ""}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionHeader icon={FileText} label="Documento de identidad" />
        <Select name="identityDocumentType" defaultValue={profile?.identity_document_type ?? "licencia"}>
          <option value="licencia">Licencia de conducir</option>
          <option value="pasaporte">Pasaporte</option>
          <option value="id_estatal">ID estatal</option>
          <option value="otro">Otro documento</option>
        </Select>
        <Input
          name="identityDocumentLast4"
          placeholder="Ultimos 4 caracteres del numero de documento"
          defaultValue={profile?.identity_document_last4 ?? ""}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionHeader icon={WalletCards} label="Metodo de pago" />
        <Input
          name="paymentAppName"
          placeholder="App de pago usada: Zelle, CashApp, PayPal..."
          defaultValue={profile?.payment_app_name ?? ""}
        />
        <Input
          name="paymentAccountOwner"
          placeholder="Nombre del titular que envia el pago"
          defaultValue={profile?.payment_account_owner ?? profile?.full_name ?? ""}
          required
        />
        <Input
          name="kycProviderReference"
          placeholder="Referencia de verificacion externa (si aplica)"
          defaultValue={profile?.kyc_provider_reference ?? ""}
        />
      </div>

      <div className="grid gap-4">
        <SectionHeader icon={ShieldCheck} label="Notas y seguridad" />
        <Textarea
          name="identityNote"
          placeholder="Nota opcional: aclara si usaste otro metodo, pagas desde otra cuenta o necesitas que MSM sepa algo sobre tu verificacion."
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900 transition hover:border-amber-300">
        <input
          name="chargebackPolicyAccepted"
          type="checkbox"
          required
          defaultChecked={Boolean(profile?.chargeback_policy_accepted_at)}
          className="mt-1 h-5 w-5 shrink-0 accent-msm-blue"
        />
        <span>
          Acepto que despues de recibir producto, servicio o remesa, una reclamacion falsa, contracargo indebido,
          desconocimiento malicioso del pago o datos falsos puede causar bloqueo de cuenta, investigacion,
          cancelacion de ordenes y registro antifraude.
        </span>
      </label>

      {state.message && (
        <div className={"flex items-start gap-3 rounded-lg border p-4 text-sm font-semibold " + (state.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800")}>
          {state.ok ? <ShieldCheck className="mt-0.5 shrink-0" size={20} /> : <AlertTriangle className="mt-0.5 shrink-0" size={20} />}
          <span>{state.message}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full gap-3 bg-gradient-to-r from-msm-blue to-msm-electric py-3 text-base shadow-glow">
        <ShieldCheck size={20} />
        {pending ? "Guardando informacion..." : "Guardar y enviar KYC"}
      </Button>
    </form>
  );
}
