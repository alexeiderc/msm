"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { submitRemittancePaymentProof } from "@/server/actions/remittances";
import { emptyActionResult } from "@/types/actions";

type RemittanceProofFormProps = {
  remittanceId: string;
  paymentMethodId?: string | null;
  paymentAccountId?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  country?: string | null;
  senderName?: string | null;
};

export function RemittanceProofForm({
  remittanceId,
  paymentMethodId,
  paymentAccountId,
  amount,
  currency,
  country,
  senderName
}: RemittanceProofFormProps) {
  const [state, formAction, pending] = useActionState(submitRemittancePaymentProof, emptyActionResult);

  return (
    <form
      action={formAction}
      className="mt-6 grid gap-4 rounded-lg border border-msm-line bg-white p-4 shadow-soft md:p-5"
    >
      <input type="hidden" name="remittanceId" value={remittanceId} />
      {paymentMethodId ? <input type="hidden" name="paymentMethodId" value={paymentMethodId} /> : null}
      {paymentAccountId ? <input type="hidden" name="paymentAccountId" value={paymentAccountId} /> : null}

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-msm-ink">
        <p className="font-bold">Remesa ID: {remittanceId}</p>
        <p className="mt-1">
          Puedes subir la captura como archivo o pegar una URL de imagen. Economia revisa antes de activar entrega.
        </p>
      </div>

      {!paymentMethodId ? <Input name="paymentMethodId" placeholder="ID metodo de pago asignado" required /> : null}
      {!paymentAccountId ? <Input name="paymentAccountId" placeholder="ID cuenta asignada, si aplica" /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input name="proofFile" type="file" accept="image/*" />
        <Input name="imageUrl" type="url" placeholder="O pega URL de captura" />
        <Input name="reference" placeholder="Referencia del pago" required />
        <Input name="amount" type="number" step="0.01" placeholder="Monto enviado" defaultValue={amount ?? ""} required />
        <Select name="currency" required defaultValue={currency ?? "USD"}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="MXN">MXN</option>
          <option value="USDT">USDT</option>
          <option value="CUP">CUP</option>
        </Select>
        <Input name="country" placeholder="Pais desde donde se pago" defaultValue={country ?? ""} required />
        <Input name="senderName" placeholder="Nombre de quien envio" defaultValue={senderName ?? ""} required />
        <Input name="paidAt" type="datetime-local" required />
      </div>

      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
          {state.id ? `${state.message} ID: ${state.id}` : state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full md:w-auto">
        <UploadCloud size={17} />
        {pending ? "Enviando comprobante..." : "Enviar comprobante de remesa"}
      </Button>
    </form>
  );
}
