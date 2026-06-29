"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { openSupportTicket } from "@/server/actions/support";
import { emptyActionResult } from "@/types/actions";

export function SupportTicketForm({ orderId }: { orderId?: string }) {
  const [state, formAction, pending] = useActionState(openSupportTicket, emptyActionResult);

  return (
    <form action={formAction} className="mt-6 grid gap-4 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      {orderId ? (
        <>
          <input type="hidden" name="orderId" value={orderId} />
          <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-msm-ink">
            Reclamacion enlazada a la orden seleccionada.
          </div>
        </>
      ) : (
        <Input name="orderId" placeholder="ID interno de la orden" required />
      )}
      <Select name="reason" required defaultValue="demora">
        <option value="demora">Demora</option>
        <option value="producto_incorrecto">Producto incorrecto</option>
        <option value="producto_danado">Producto danado</option>
        <option value="falta_de_entrega">Falta de entrega</option>
        <option value="garantia">Garantia</option>
        <option value="otro">Otro</option>
      </Select>
      <Input name="subject" placeholder="Resumen" required />
      <Textarea name="body" placeholder="Describe la reclamacion" required />
      <Input name="evidenceUrl" type="url" placeholder="URL de evidencia opcional" />
      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
          {state.id ? `${state.message} ID: ${state.id}` : state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>{pending ? "Abriendo..." : "Abrir reclamacion"}</Button>
    </form>
  );
}
