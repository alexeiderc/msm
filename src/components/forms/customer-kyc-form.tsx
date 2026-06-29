"use client";

import { useActionState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
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

export function CustomerKycForm({ profile }: CustomerKycFormProps) {
  const [state, formAction, pending] = useActionState(updateCustomerKyc, emptyActionResult);

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <div>
        <h2 className="text-lg font-bold">KYC del cliente</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          MSM usa esta verificacion para reducir pagos desconocidos, reclamos falsos, contracargos y abuso
          despues de la entrega.
        </p>
      </div>

      <div className="grid gap-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-msm-ink">
        <span className="font-bold">Estado KYC: {profile?.customer_kyc_status ?? "pendiente"}</span>
        <span>Riesgo: {profile?.customer_risk_level ?? "normal"}</span>
        <span>Metodo de pago validado por MSM: {profile?.payment_method_valid ? "si" : "pendiente"}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input name="fullName" placeholder="Nombre completo legal" defaultValue={profile?.full_name ?? ""} required />
        <Input name="phone" placeholder="Telefono / WhatsApp" defaultValue={profile?.phone ?? ""} required />
        <Input name="country" placeholder="Pais donde resides" defaultValue={profile?.country ?? "Estados Unidos"} required />
        <Select name="identityDocumentType" defaultValue={profile?.identity_document_type ?? "licencia"}>
          <option value="licencia">Licencia de conducir</option>
          <option value="pasaporte">Pasaporte</option>
          <option value="id_estatal">ID estatal</option>
          <option value="otro">Otro documento</option>
        </Select>
        <Input
          name="identityDocumentLast4"
          placeholder="Ultimos caracteres del documento"
          defaultValue={profile?.identity_document_last4 ?? ""}
          required
        />
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
          placeholder="Referencia app KYC externa, si existe"
          defaultValue={profile?.kyc_provider_reference ?? ""}
        />
      </div>

      <Textarea
        name="address"
        placeholder="Direccion principal del comprador"
        defaultValue={profile?.address ?? ""}
        required
      />
      <Textarea
        name="identityNote"
        placeholder="Nota opcional: metodo usado, aclaracion del documento o explicacion si paga otra persona"
      />

      <label className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
        <input
          name="chargebackPolicyAccepted"
          type="checkbox"
          required
          defaultChecked={Boolean(profile?.chargeback_policy_accepted_at)}
          className="mt-1 h-5 w-5 accent-msm-blue"
        />
        Acepto que despues de recibir producto, servicio o remesa, una reclamacion falsa, contracargo indebido,
        desconocimiento malicioso del pago o datos falsos puede causar bloqueo de cuenta, investigacion,
        cancelacion de ordenes y registro antifraude.
      </label>

      {!profile?.chargeback_policy_accepted_at ? (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-white p-3 text-sm leading-6 text-slate-700">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
          <span>
            Para operar con mas confianza, MSM debe poder relacionar el cliente, el metodo de pago y la entrega.
          </span>
        </div>
      ) : null}

      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="bg-msm-blue">
        <ShieldCheck size={17} />
        {pending ? "Guardando..." : "Guardar KYC"}
      </Button>
    </form>
  );
}
