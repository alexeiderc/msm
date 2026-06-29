"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { submitPaymentProof } from "@/server/actions/payments";
import { emptyActionResult } from "@/types/actions";

type PaymentProofFormProps = {
  orderId: string;
  paymentMethodId?: string | null;
  paymentAccountId?: string | null;
  amount?: number | null;
  currency?: string | null;
  country?: string | null;
  methodLabel?: string | null;
  accountLabel?: string | null;
};

export function PaymentProofForm({
  orderId,
  paymentMethodId,
  paymentAccountId,
  amount,
  currency,
  country,
  methodLabel,
  accountLabel
}: PaymentProofFormProps) {
  const [state, formAction, pending] = useActionState(submitPaymentProof, emptyActionResult);

  return (
    <form action={formAction} className="mt-6 grid gap-4 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <input type="hidden" name="orderId" value={orderId} />
      {paymentMethodId ? <input type="hidden" name="paymentMethodId" value={paymentMethodId} /> : null}
      {paymentAccountId ? <input type="hidden" name="paymentAccountId" value={paymentAccountId} /> : null}
      {amount ? <input type="hidden" name="amount" value={amount} /> : null}
      {currency ? <input type="hidden" name="currency" value={currency} /> : null}
      {country ? <input type="hidden" name="country" value={country} /> : null}
      <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-msm-ink">
        <p className="font-bold">Pago asignado a esta orden</p>
        <p>Metodo: {methodLabel ?? "Metodo asignado dentro de la orden"}</p>
        <p>Cuenta: {accountLabel ?? "Cuenta pendiente o no asignada"}</p>
        <p>Monto: {amount ? `${amount} ${currency ?? ""}` : "Monto de la orden"}</p>
      </div>
      <label className="space-y-1 text-sm font-semibold">
        Captura del comprobante
        <Input name="proofFile" type="file" accept="image/*" />
      </label>
      <Input name="imageUrl" type="url" placeholder="O pega URL de captura si ya esta subida" />
      <Input name="reference" placeholder="Referencia" required />
      {!amount ? <Input name="amount" type="number" step="0.01" placeholder="Monto" required /> : null}
      {!currency ? (
        <Select name="currency" required defaultValue="USD">
          <option>USD</option>
          <option>EUR</option>
          <option>MXN</option>
          <option>USDT</option>
        </Select>
      ) : null}
      {!country ? <Input name="country" placeholder="Pais desde donde se pago" required /> : null}
      {!paymentMethodId ? <Input name="paymentMethodId" placeholder="ID metodo de pago asignado" required /> : null}
      {!paymentAccountId ? <Input name="paymentAccountId" placeholder="ID cuenta asignada dentro de la orden" /> : null}
      <Input name="paidAt" type="datetime-local" required />
      <Input name="senderName" placeholder="Nombre de quien envio el dinero" required />
      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>{pending ? "Enviando..." : "Enviar comprobante"}</Button>
    </form>
  );
}
