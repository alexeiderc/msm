"use client";

import { useActionState } from "react";
import { emptyActionResult } from "@/types/actions";
import { reviewReturn } from "@/server/actions/returns";

export function ReturnReviewForm({ returnId, currentStatus }: { returnId: string; currentStatus: string }) {
  const [state, actionRef, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      formData.set("returnId", returnId);
      return reviewReturn(emptyActionResult, formData);
    },
    emptyActionResult
  );

  if (currentStatus === "reembolsado" || currentStatus === "rechazado") {
    return <p className="text-xs text-slate-500">Devolucion {currentStatus}.</p>;
  }

  return (
    <form action={actionRef} className="mt-2 flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs font-semibold">Estado</label>
        <select name="status" className="h-8 rounded border px-2 text-sm">
          <option value="aprobado">Aprobar</option>
          <option value="rechazado">Rechazar</option>
          <option value="en_transito">En transito</option>
          <option value="recibido">Recibido</option>
          <option value="reembolsado">Reembolsar</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold">Tipo resolucion</label>
        <select name="resolutionType" className="h-8 rounded border px-2 text-sm">
          <option value="">N/A</option>
          <option value="refund">Reembolso</option>
          <option value="replacement">Reemplazo</option>
          <option value="store_credit">Credito</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold">Monto reembolso</label>
        <input name="resolutionAmount" type="number" step="0.01" className="h-8 w-24 rounded border px-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-semibold">Nota admin</label>
        <input name="adminNote" className="h-8 rounded border px-2 text-sm" />
      </div>
      <button disabled={pending} className="h-8 rounded bg-msm-blue px-3 text-xs font-bold text-white disabled:opacity-50">
        {pending ? "..." : "Actualizar"}
      </button>
      {state?.message && <p className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</p>}
    </form>
  );
}
