"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startIdswyftVerification } from "@/server/actions/kyc";
import { emptyActionResult } from "@/types/actions";

type Props = {
  kycStatus?: string | null;
};

export function IdswyftKycButton({ kycStatus }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(async () => {
    const result = await startIdswyftVerification();
    if (result.ok) {
      router.push(result.url);
    }
    return result.ok
      ? { ok: true, message: "Redirigiendo a Idswyft..." }
      : { ok: false, message: result.message };
  }, emptyActionResult);

  const needsVerification = !kycStatus || kycStatus === "pendiente" || kycStatus === "rechazado";

  if (!needsVerification) {
    return null;
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 shrink-0 text-msm-blue" size={22} />
        <div className="flex-1">
          <h3 className="font-bold text-msm-ink">Verificacion de identidad</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Idswyft verifica tu identidad con documento y reconocimiento facial. El proceso toma 1-2 minutos.
          </p>
          {kycStatus === "rechazado" && (
            <div className="mt-2 flex items-start gap-2 rounded-md border border-red-200 bg-white p-3 text-sm">
              <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={18} />
              <span className="text-red-800">
                Tu verificacion fue rechazada. Vuelve a intentar con un documento valido y buena iluminacion.
              </span>
            </div>
          )}
          {state.message && (
            <p className={state.ok ? "mt-2 text-sm font-semibold text-msm-blue" : "mt-2 text-sm font-semibold text-red-700"}>
              {state.message}
            </p>
          )}
          <form action={formAction} className="mt-3">
            <Button type="submit" disabled={pending} className="bg-msm-blue">
              <ExternalLink size={17} />
              {pending ? "Conectando con Idswyft..." : "Verificar con Idswyft"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
