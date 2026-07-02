"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { createWalletLoadRequest, reviewWalletLoadRequest } from "@/server/actions/wallet";
import type { ActionResult } from "@/types/actions";

const initialState: ActionResult = { ok: false, message: "" };

export function WalletLoadRequestForm({
  methods
}: {
  methods: { id: string; country: string; currency: string; type: string; status: string }[];
}) {
  const [state, formAction, pending] = useActionState(createWalletLoadRequest, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold">
          Monto a cargar
          <Input name="amount" type="number" min="1" step="0.01" required placeholder="100.00" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Moneda Saldo MSM
          <Select name="currency" defaultValue="USD" required>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="USDT">USDT</option>
            <option value="MXN">MXN</option>
          </Select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold">
          Pais desde donde pagas
          <Input name="country" required placeholder="Estados Unidos" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Metodo externo usado
          <Select name="paymentMethodId">
            <option value="">Coordinar por WhatsApp / ELIANA</option>
            {methods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.country} - {method.type} - {method.currency} ({method.status})
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold">
          Nombre de quien envio
          <Input name="senderName" required placeholder="Nombre del pagador" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Referencia
          <Input name="reference" required placeholder="Codigo, memo o ultimos digitos" />
        </label>
      </div>

      <label className="space-y-1 text-sm font-semibold">
        URL del comprobante
        <Input name="proofUrl" type="url" placeholder="https://..." />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        Nota opcional
        <Textarea name="note" placeholder="Detalles para Economia" />
      </label>

      {state.message ? (
        <p className={state.ok ? "text-sm font-bold text-msm-blue" : "text-sm font-bold text-red-700"}>
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        <CheckCircle2 size={17} />
        {pending ? "Enviando..." : "Solicitar carga de Saldo MSM"}
      </Button>
    </form>
  );
}

export function WalletLoadReviewButtons({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState(reviewWalletLoadRequest, initialState);

  return (
    <div className="grid gap-2">
      <form action={formAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="requestId" value={requestId} />
        <Button type="submit" name="decision" value="aprobado" disabled={pending} className="min-h-9 px-3 py-1 text-xs">
          Aprobar
        </Button>
        <Button
          type="submit"
          name="decision"
          value="rechazado"
          disabled={pending}
          className="min-h-9 bg-red-600 px-3 py-1 text-xs hover:bg-red-700"
        >
          Rechazar
        </Button>
        <Button
          type="submit"
          name="decision"
          value="nueva_evidencia"
          disabled={pending}
          className="min-h-9 bg-msm-ink px-3 py-1 text-xs hover:bg-msm-navy"
        >
          Pedir evidencia
        </Button>
      </form>
      {state.message ? (
        <p className={state.ok ? "text-xs font-bold text-msm-blue" : "text-xs font-bold text-red-700"}>{state.message}</p>
      ) : null}
    </div>
  );
}
