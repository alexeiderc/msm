"use client";

import { useActionState } from "react";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { createPaymentAccount, createPaymentMethod, reviewPaymentProof } from "@/server/actions/payments";
import { registerPayout } from "@/server/actions/economy";
import { reviewRemittancePaymentProof, updateRemittanceStatus } from "@/server/actions/remittances";
import { emptyActionResult, type ActionResult } from "@/types/actions";

function ActionMessage({ state }: { state: ActionResult }) {
  if (!state.message) return null;

  return (
    <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
      {state.id ? `${state.message} ID: ${state.id}` : state.message}
    </p>
  );
}

export function PayoutForm() {
  const [state, formAction, pending] = useActionState(registerPayout, emptyActionResult);

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <Input name="sellerId" placeholder="ID vendedor" required />
      <Input name="amount" type="number" step="0.01" placeholder="Monto pagado" required />
      <Select name="method" defaultValue="Zelle">
        <option>Zelle</option>
        <option>Transferencia</option>
        <option>USDT</option>
        <option>Otro</option>
      </Select>
      <Input name="reference" placeholder="Referencia interna" />
      <Input name="receiptUrl" type="url" placeholder="URL comprobante interno" />
      <div className="grid grid-cols-2 gap-3">
        <Input name="periodStart" type="date" required />
        <Input name="periodEnd" type="date" required />
      </div>
      <ActionMessage state={state} />
      <Button type="submit" disabled={pending}>
        <ReceiptText size={17} />
        {pending ? "Guardando..." : "Guardar payout"}
      </Button>
    </form>
  );
}

export function PaymentMethodForm() {
  const [state, formAction, pending] = useActionState(createPaymentMethod, emptyActionResult);

  return (
    <form action={formAction} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="font-bold">Metodo manual por pais</h2>
      <div className="mt-4 grid gap-3">
        <Input name="country" placeholder="Pais" required />
        <Input name="currency" placeholder="Moneda" required />
        <Input name="type" placeholder="Zelle, Oxxo, USDT..." required />
        <Select name="status" defaultValue="activo">
          <option value="activo">activo</option>
          <option value="pausado">pausado</option>
          <option value="oculto">oculto</option>
        </Select>
        <Input name="minAmount" type="number" step="0.01" placeholder="Minimo" required />
        <Input name="maxAmount" type="number" step="0.01" placeholder="Maximo" required />
        <Input name="feePercent" type="number" step="0.01" placeholder="Comision %" required />
        <Input name="priority" type="number" placeholder="Prioridad" required />
        <Input name="dailyCapacity" type="number" step="0.01" placeholder="Capacidad diaria" required />
        <Input name="visibleInstructions" placeholder="Instrucciones visibles" required />
        <Input name="internalInstructions" placeholder="Instrucciones internas" />
        <Input name="responsibleEconomicId" placeholder="Responsable economico" />
        <ActionMessage state={state} />
        <Button type="submit" disabled={pending}>{pending ? "Creando..." : "Crear metodo"}</Button>
      </div>
    </form>
  );
}

export function PaymentAccountForm() {
  const [state, formAction, pending] = useActionState(createPaymentAccount, emptyActionResult);

  return (
    <form action={formAction} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="font-bold">Cuenta rotativa</h2>
      <div className="mt-4 grid gap-3">
        <Input name="methodId" placeholder="ID metodo" required />
        <Input name="visibleName" placeholder="Nombre visible en orden" required />
        <Input name="internalAlias" placeholder="Alias interno" required />
        <Input name="dailyLimit" type="number" step="0.01" placeholder="Limite diario" required />
        <Select name="status" defaultValue="activa">
          <option value="activa">activa</option>
          <option value="pausada">pausada</option>
          <option value="bloqueada">bloqueada</option>
        </Select>
        <Input name="expiresAt" type="date" />
        <Input name="internalNote" placeholder="Nota interna" />
        <Input name="usageRules" placeholder="Reglas de uso" />
        <ActionMessage state={state} />
        <Button type="submit" disabled={pending}>{pending ? "Registrando..." : "Registrar cuenta"}</Button>
      </div>
    </form>
  );
}

export function PaymentReviewForm() {
  const [state, formAction, pending] = useActionState(reviewPaymentProof, emptyActionResult);

  return (
    <form action={formAction} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="font-bold">Revisar comprobante</h2>
      <p className="mt-1 text-sm text-slate-600">Aprobar cambia la orden a pago_confirmado y registra ledger.</p>
      <div className="mt-4 grid gap-3">
        <Input name="proofId" placeholder="ID comprobante" required />
        <Input name="orderId" placeholder="ID orden" required />
        <Select name="decision" defaultValue="aprobado">
          <option value="aprobado">aprobado</option>
          <option value="rechazado">rechazado</option>
          <option value="nueva_evidencia">nueva_evidencia</option>
        </Select>
        <Input name="note" placeholder="Nota del revisor" />
        <ActionMessage state={state} />
        <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar revision"}</Button>
      </div>
    </form>
  );
}

export function InlinePaymentReviewForm({
  proofId,
  orderId,
  decision,
  label
}: {
  proofId: string;
  orderId: string;
  decision: "aprobado" | "rechazado" | "nueva_evidencia";
  label: string;
}) {
  const [state, formAction, pending] = useActionState(reviewPaymentProof, emptyActionResult);

  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="proofId" value={proofId} />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="decision" value={decision} />
      <input type="hidden" name="note" value={`Revision rapida economia: ${label}`} />
      <Button type="submit" disabled={pending} className="min-h-9 px-3 py-1 text-xs">
        {pending ? "..." : label}
      </Button>
      {state.message ? <span className={state.ok ? "text-xs text-msm-blue" : "text-xs text-red-700"}>{state.message}</span> : null}
    </form>
  );
}

export function RemittancePaymentReviewForm() {
  const [state, formAction, pending] = useActionState(reviewRemittancePaymentProof, emptyActionResult);

  return (
    <form action={formAction} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="font-bold">Revisar comprobante remesa</h2>
      <p className="mt-1 text-sm text-slate-600">Aprobar cambia la remesa a pago_recibido.</p>
      <div className="mt-4 grid gap-3">
        <Input name="proofId" placeholder="ID comprobante remesa" required />
        <Input name="remittanceId" placeholder="ID remesa" required />
        <Select name="decision" defaultValue="aprobado">
          <option value="aprobado">aprobado</option>
          <option value="rechazado">rechazado</option>
          <option value="nueva_evidencia">nueva_evidencia</option>
        </Select>
        <Input name="note" placeholder="Nota del revisor" />
        <ActionMessage state={state} />
        <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar revision remesa"}</Button>
      </div>
    </form>
  );
}

export function InlineRemittancePaymentReviewForm({
  proofId,
  remittanceId,
  decision,
  label
}: {
  proofId: string;
  remittanceId: string;
  decision: "aprobado" | "rechazado" | "nueva_evidencia";
  label: string;
}) {
  const [state, formAction, pending] = useActionState(reviewRemittancePaymentProof, emptyActionResult);

  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="proofId" value={proofId} />
      <input type="hidden" name="remittanceId" value={remittanceId} />
      <input type="hidden" name="decision" value={decision} />
      <input type="hidden" name="note" value={`Revision rapida economia: ${label}`} />
      <Button type="submit" disabled={pending} className="min-h-9 px-3 py-1 text-xs">
        {pending ? "..." : label}
      </Button>
      {state.message ? <span className={state.ok ? "text-xs text-msm-blue" : "text-xs text-red-700"}>{state.message}</span> : null}
    </form>
  );
}

export function RemittanceStatusForm() {
  const [state, formAction, pending] = useActionState(updateRemittanceStatus, emptyActionResult);

  return (
    <form action={formAction} className="rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="font-bold">Operar remesa</h2>
      <p className="mt-1 text-sm text-slate-600">Actualiza estado, registra evento y audita la accion.</p>
      <div className="mt-4 grid gap-3">
        <Input name="remittanceId" placeholder="ID remesa" required />
        <Select name="status" defaultValue="pago_recibido">
          <option value="pago_recibido">pago_recibido</option>
          <option value="en_revision">en_revision</option>
          <option value="lista_para_entrega">lista_para_entrega</option>
          <option value="entregada">entregada</option>
          <option value="cerrada">cerrada</option>
          <option value="incidencia">incidencia</option>
          <option value="cancelada">cancelada</option>
        </Select>
        <Input name="note" placeholder="Nota economica o evidencia interna" />
        <ActionMessage state={state} />
        <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Actualizar remesa"}</Button>
      </div>
    </form>
  );
}
