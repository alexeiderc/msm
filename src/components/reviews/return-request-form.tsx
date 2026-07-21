"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { requestReturn } from "@/server/actions/returns";
import type { ActionResult } from "@/types/actions";

const initialState: ActionResult = { ok: false, message: "" };

const reasons = [
  "Producto no recibido",
  "Producto defectuoso o danado",
  "Producto incorrecto",
  "Producto no coincide con la descripcion",
  "Producto llego fuera de tiempo",
  "Cambio de opinion"
];

export function ReturnRequestForm({
  orderId,
  items
}: {
  orderId: string;
  items: { id: string; name: string; quantity: number }[];
}) {
  const [state, formAction, pending] = useActionState(requestReturn, initialState);

  if (state.ok) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <label className="space-y-1 text-sm font-semibold">
        Producto (opcional)
        <Select name="orderItemId">
          <option value="">Toda la orden</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} x{item.quantity}
            </option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-sm font-semibold">
        Motivo de devolucion
        <Select name="reason" required>
          <option value="">Seleccionar</option>
          {reasons.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
      </label>

      <label className="space-y-1 text-sm font-semibold">
        Descripcion (opcional)
        <Textarea name="description" placeholder="Detalla el motivo de tu devolucion..." />
      </label>

      <label className="space-y-1 text-sm font-semibold">
        URLs de evidencia (opcional, una por linea)
        <Textarea name="evidenceUrls" placeholder="https://ejemplo.com/foto1.jpg" />
      </label>

      {state.message && !state.ok ? (
        <p className="text-sm text-red-700">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar solicitud de devolucion"}
      </Button>
    </form>
  );
}
