"use client";

import { useActionState } from "react";
import { emptyActionResult } from "@/types/actions";
import { adjustInventory } from "@/server/actions/inventory";

export function InventoryForm() {
  const [state, action, pending] = useActionState(adjustInventory, emptyActionResult);

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="text-xs font-semibold">ID del producto</label>
        <input name="productId" required className="mt-1 h-9 w-full rounded border px-2 text-sm font-mono" placeholder="uuid" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold">Cambio (+/-)</label>
          <input name="quantityChange" type="number" required className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold">Razon</label>
          <select name="reason" className="mt-1 h-9 w-full rounded border px-2 text-sm">
            <option value="adjustment">Ajuste</option>
            <option value="restock">Reabastecer</option>
            <option value="cancellation">Cancelacion</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold">Nota</label>
        <input name="note" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
      </div>
      <button disabled={pending} className="h-9 w-full rounded bg-msm-blue text-sm font-bold text-white disabled:opacity-50">
        {pending ? "Ajustando..." : "Ajustar stock"}
      </button>
      {state?.message && <p className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
