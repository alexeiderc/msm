"use client";

import { useActionState } from "react";
import { emptyActionResult } from "@/types/actions";
import { createShippingRate } from "@/server/actions/tax-shipping";

export function ShippingRateForm() {
  const [state, action, pending] = useActionState(createShippingRate, emptyActionResult);

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="text-xs font-semibold">Pais</label>
        <input name="country" defaultValue="Cuba" required className="mt-1 h-9 w-full rounded border px-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold">Provincia</label>
          <input name="province" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold">Municipio</label>
          <input name="municipality" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold">Costo</label>
          <input name="cost" type="number" step="0.01" required className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold">Min. orden</label>
          <input name="minOrderAmount" type="number" step="0.01" defaultValue="0" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold">ETA</label>
          <input name="estimatedDays" defaultValue="3-5" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
      </div>
      <button disabled={pending} className="h-9 w-full rounded bg-msm-blue text-sm font-bold text-white disabled:opacity-50">
        {pending ? "Guardando..." : "Crear tarifa"}
      </button>
      {state?.message && <p className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
