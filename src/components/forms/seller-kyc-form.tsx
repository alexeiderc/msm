"use client";

import { useActionState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { updateSellerKyc } from "@/server/actions/sellers";
import { emptyActionResult } from "@/types/actions";

type SellerKycFormProps = {
  sellerKyc?: {
    full_name?: string | null;
    phone?: string | null;
    document?: string | null;
    location?: string | null;
    operation_zone?: string | null;
    video_url?: string | null;
    community_verification_vip?: string | null;
    status?: string | null;
  } | null;
};

export function SellerKycForm({ sellerKyc }: SellerKycFormProps) {
  const [state, formAction, pending] = useActionState(updateSellerKyc, emptyActionResult);
  const isRejected = sellerKyc?.status === "rechazado";

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <div>
        <h2 className="text-lg font-bold">KYC del vendedor</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          MSM verifica tu identidad como vendedor antes de activar operaciones.
        </p>
      </div>

      {isRejected && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={18} />
          <span>Tu KYC fue rechazado. Corrige los datos y vuelve a enviar.</span>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <Input name="fullName" placeholder="Nombre completo legal" defaultValue={sellerKyc?.full_name ?? ""} required />
        <Input name="phone" placeholder="Telefono / WhatsApp" defaultValue={sellerKyc?.phone ?? ""} required />
        <Input name="document" placeholder="Documento de identidad (numero)" defaultValue={sellerKyc?.document ?? ""} required />
        <Input name="location" placeholder="Direccion o ubicacion" defaultValue={sellerKyc?.location ?? ""} required />
        <Input name="operationZone" placeholder="Zona de operacion / municipios" defaultValue={sellerKyc?.operation_zone ?? ""} required />
        <Input name="videoUrl" type="url" placeholder="Video de verificacion (URL)" defaultValue={sellerKyc?.video_url ?? ""} />
      </div>

      <Textarea
        name="communityVerificationVip"
        placeholder="Referencias comunitarias o de otros vendedores VIP que puedan responder por ti"
        defaultValue={sellerKyc?.community_verification_vip ?? ""}
      />

      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="bg-msm-blue">
        <ShieldCheck size={17} />
        {pending ? "Guardando..." : "Guardar KYC vendedor"}
      </Button>
    </form>
  );
}
