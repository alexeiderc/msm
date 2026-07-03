"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Camera, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
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

  const steps = [
    { icon: Camera, label: "Toma una foto de tu documento de identidad" },
    { icon: Camera, label: "Selfie con reconocimiento facial" },
    { icon: CheckCircle2, label: "Espera la verificacion automatica (1-2 min)" },
  ];

  return (
    <div className="rounded-xl border border-msm-blue/20 bg-gradient-to-br from-blue-50 to-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-msm-blue to-msm-electric shadow-glow">
          <Camera size={26} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black text-msm-ink">Verificacion rapida con Idswyft</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Verifica tu identidad en minutos con documento y reconocimiento facial. Es seguro y solo toma 1-2 minutos.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-blue-100 bg-white p-3 text-sm">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-msm-blue">{i + 1}</span>
            <span className="font-semibold text-slate-700">{step.label}</span>
          </div>
        ))}
      </div>

      {kycStatus === "rechazado" && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
          <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={18} />
          <span className="font-semibold text-red-800">
            Tu verificacion anterior fue rechazada. Asegurate de usar un documento valido, buena iluminacion y sin reflejos.
          </span>
        </div>
      )}

      {state.message && (
        <div className={"mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm font-semibold " + (state.ok ? "border-blue-200 bg-blue-50 text-msm-blue" : "border-red-200 bg-red-50 text-red-700")}>
          {state.ok ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} /> : <AlertTriangle className="mt-0.5 shrink-0" size={18} />}
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="mt-5">
        <Button type="submit" disabled={pending} className="w-full gap-3 bg-gradient-to-r from-msm-blue to-msm-electric py-3 text-base shadow-glow">
          {pending ? <Loader2 className="animate-spin" size={18} /> : <ExternalLink size={18} />}
          {pending ? "Conectando con Idswyft..." : "Comenzar verificacion"}
        </Button>
      </form>
    </div>
  );
}
