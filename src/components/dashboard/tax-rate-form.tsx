"use client";

import { useActionState } from "react";
import { emptyActionResult } from "@/types/actions";
import { createTaxRate } from "@/server/actions/tax-shipping";

export function TaxRateForm() {
  const [state, action, pending] = useActionState(createTaxRate, emptyActionResult);

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="text-xs font-semibold">Pais</label>
        <input name="country" defaultValue="Cuba" required className="mt-1 h-9 w-full rounded border px-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold">Provincia (opcional)</label>
        <input name="province" className="mt-1 h-9 w-full rounded border px-2 text-sm" placeholder="Todas las provincias" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold">Tasa %</label>
          <input name="ratePercent" type="number" step="0.01" required className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold">Nombre</label>
          <input name="taxName" defaultValue="VAT" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
      </div>
      <button disabled={pending} className="h-9 w-full rounded bg-msm-blue text-sm font-bold text-white disabled:opacity-50">
        {pending ? "Guardando..." : "Crear tasa"}
      </button>
      {state?.message && <p className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
