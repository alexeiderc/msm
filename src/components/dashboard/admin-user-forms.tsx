"use client";

import { useActionState } from "react";
import { ShieldCheck, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { updateAdminUserKyc, updateAdminUserRole, updateAdminUserStatus } from "@/server/actions/users";
import { emptyActionResult, type ActionResult } from "@/types/actions";

function Message({ state }: { state: ActionResult }) {
  if (!state.message) return null;
  return <p className={state.ok ? "text-sm font-bold text-msm-blue" : "text-sm font-bold text-red-700"}>{state.message}</p>;
}

export function AdminUserRoleForm({ userId, currentRole }: { userId: string; currentRole?: string | null }) {
  const [state, formAction, pending] = useActionState(updateAdminUserRole, emptyActionResult);

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="flex items-center gap-2 font-bold"><UserCog size={17} /> Cambiar rol</h3>
      <input type="hidden" name="userId" value={userId} />
      <Select name="role" defaultValue={currentRole ?? "cliente"}>
        <option value="cliente">cliente</option>
        <option value="vendedor_vip">vendedor_vip</option>
        <option value="administrador">administrador</option>
        <option value="administrador_economico">administrador_economico</option>
        <option value="superadmin">superadmin</option>
      </Select>
      <Textarea name="note" placeholder="Nota administrativa" />
      <Message state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Actualizar rol"}</Button>
    </form>
  );
}

export function AdminUserStatusForm({ userId, currentStatus }: { userId: string; currentStatus?: string | null }) {
  const [state, formAction, pending] = useActionState(updateAdminUserStatus, emptyActionResult);

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="flex items-center gap-2 font-bold"><ShieldCheck size={17} /> Estado de cuenta</h3>
      <input type="hidden" name="userId" value={userId} />
      <Select name="status" defaultValue={currentStatus ?? "activo"}>
        <option value="activo">activo</option>
        <option value="pausado">pausado</option>
        <option value="bloqueado">bloqueado</option>
      </Select>
      <Textarea name="note" placeholder="Motivo o nota interna" />
      <Message state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Actualizar estado"}</Button>
    </form>
  );
}

export function AdminUserKycForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(updateAdminUserKyc, emptyActionResult);

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-msm-line p-4">
      <h3 className="font-bold">KYC y riesgo</h3>
      <input type="hidden" name="userId" value={userId} />
      <div className="grid gap-3 md:grid-cols-2">
        <Select name="status" defaultValue="requiere_revision">
          <option value="pendiente">pendiente</option>
          <option value="requiere_revision">requiere_revision</option>
          <option value="aprobado">aprobado</option>
          <option value="rechazado">rechazado</option>
        </Select>
        <Select name="riskLevel" defaultValue="normal">
          <option value="normal">normal</option>
          <option value="revision">revision</option>
          <option value="alto">alto</option>
          <option value="bloqueado">bloqueado</option>
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="paymentMethodValid" type="checkbox" className="h-5 w-5 accent-msm-blue" />
        Metodo de pago validado
      </label>
      <Input name="note" placeholder="Nota KYC" />
      <Message state={state} />
      <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar KYC"}</Button>
    </form>
  );
}
