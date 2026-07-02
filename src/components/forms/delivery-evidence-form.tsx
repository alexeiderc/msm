"use client";

import { useActionState, useState } from "react";
import { Camera, CheckCircle, KeyRound, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { submitDeliveryEvidence } from "@/server/actions/orders";
import { generateDeliveryOtp } from "@/server/actions/delivery";
import { emptyActionResult } from "@/types/actions";

type DeliveryEvidenceFormProps = {
  orderId: string;
  orderNumber: string;
  deliveryOtpRequired?: boolean;
  deliveryOtpVerifiedAt?: string | null;
};

export function DeliveryEvidenceForm({ orderId, orderNumber, deliveryOtpRequired, deliveryOtpVerifiedAt }: DeliveryEvidenceFormProps) {
  const [state, formAction, pending] = useActionState(submitDeliveryEvidence, emptyActionResult);
  const otpVerified = Boolean(deliveryOtpVerifiedAt);
  const [otpState, setOtpState] = useState<"idle" | "generating" | "sent">("idle");

  async function handleGenerateOtp() {
    setOtpState("generating");
    try {
      const result = await generateDeliveryOtp(orderId);
      if (result.ok) {
        setOtpState("sent");
        setTimeout(() => setOtpState("idle"), 5000);
      } else {
        alert(result.message);
        setOtpState("idle");
      }
    } catch {
      alert("Error al generar OTP");
      setOtpState("idle");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Truck size={18} /> Evidencia de entrega
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Orden #{orderNumber}
        </p>

        {!otpVerified && deliveryOtpRequired !== false && (
          <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
            <p className="text-sm font-semibold text-msm-ink">OTP de entrega</p>
            <p className="mt-1 text-xs text-slate-600">
              Genera un codigo OTP y compartelo con el receptor para verificar la entrega.
            </p>
            <button
              onClick={handleGenerateOtp}
              disabled={otpState === "generating"}
              className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              <KeyRound size={16} />
              {otpState === "generating" ? "Generando..." : otpState === "sent" ? "OTP enviado" : "Generar OTP"}
            </button>
          </div>
        )}
        {otpVerified && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-green-100 bg-green-50 p-3 text-sm font-semibold text-green-700">
            <CheckCircle size={18} /> OTP verificado
          </div>
        )}
      </div>

      <form action={formAction} className="grid gap-3 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
        <input type="hidden" name="orderId" value={orderId} />

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            name="photoUrl"
            type="url"
            placeholder="URL foto de la entrega"
          />
          <Input
            name="signatureUrl"
            type="url"
            placeholder="URL firma del receptor"
          />
          <Input
            name="receiverName"
            placeholder="Nombre del receptor"
          />
          <Input
            name="receiverDocumentLast4"
            placeholder="Ultimos digitos del documento"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            name="otpCode"
            type="text"
            placeholder="Codigo OTP (si no se verifico antes)"
            inputMode="numeric"
            maxLength={6}
          />
        </div>

        <Textarea
          name="message"
          placeholder="Mensaje o nota sobre la entrega"
        />

        {state.message ? (
          <p className={state.ok ? "text-sm font-semibold text-green-700" : "text-sm font-semibold text-red-700"}>
            {state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="bg-msm-blue">
          <Camera size={17} />
          {pending ? "Guardando..." : "Registrar entrega"}
        </Button>
      </form>
    </div>
  );
}
