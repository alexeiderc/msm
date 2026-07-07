"use client";

import { useActionState } from "react";
import { emptyActionResult } from "@/types/actions";
import { createCoupon } from "@/server/actions/coupons";

export function CouponForm() {
  const [state, action, pending] = useActionState(createCoupon, emptyActionResult);

  return (
    <form action={action} className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold">Codigo</label>
          <input name="code" required className="mt-1 h-9 w-full rounded border px-2 text-sm" placeholder="BIENVENIDO" />
        </div>
        <div>
          <label className="text-xs font-semibold">Tipo</label>
          <select name="discountType" className="mt-1 h-9 w-full rounded border px-2 text-sm">
            <option value="percentage">Porcentaje</option>
            <option value="fixed">Monto fijo</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold">Valor</label>
          <input name="discountValue" type="number" step="0.01" required className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold">Min. orden</label>
          <input name="minOrderAmount" type="number" step="0.01" defaultValue="0" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold">Usos max</label>
          <input name="maxUses" type="number" defaultValue="0" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold">Descripcion</label>
          <input name="description" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold">Inicia</label>
          <input name="startsAt" type="datetime-local" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold">Expira</label>
          <input name="expiresAt" type="datetime-local" className="mt-1 h-9 w-full rounded border px-2 text-sm" />
        </div>
      </div>
      <button disabled={pending} className="h-9 w-full rounded bg-msm-blue text-sm font-bold text-white disabled:opacity-50">
        {pending ? "Creando..." : "Crear cupon"}
      </button>
      {state?.message && <p className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
