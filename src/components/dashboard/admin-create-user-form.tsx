"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { adminCreateUser } from "@/server/actions/admin";
import type { ActionResult } from "@/types/actions";

const initialState: ActionResult = { ok: false, message: "" };

const roleOptions = [
  { value: "cliente", label: "Cliente" },
  { value: "vendedor_vip", label: "Vendedor VIP" },
  { value: "administrador", label: "Administrador" },
  { value: "administrador_economico", label: "Administrador Economico" },
  { value: "superadmin", label: "Superadmin" }
];

export function AdminCreateUserForm() {
  const [state, formAction, pending] = useActionState(adminCreateUser, initialState);

  if (state.ok) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-semibold">
          Correo electronico
          <Input name="email" type="email" required placeholder="usuario@ejemplo.com" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Contrasena temporal
          <Input name="password" type="text" required placeholder="Minimo 8 caracteres" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Nombre completo
          <Input name="fullName" required placeholder="Nombre y apellidos" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Telefono (opcional)
          <Input name="phone" placeholder="+53 5XXXXXXX" />
        </label>
        <label className="space-y-1 text-sm font-semibold">
          Rol
          <Select name="role" required>
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </label>
      </div>

      <details className="rounded-lg border border-msm-line p-3">
        <summary className="cursor-pointer text-sm font-semibold text-msm-blue">
          Datos de vendedor VIP (opcional)
        </summary>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold">
            Nombre comercial del vendedor
            <Input name="sellerName" placeholder="Ej. Tienda de Maria" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            Nombre de la tienda
            <Input name="storeName" placeholder="Ej. Tienda María Store" />
          </label>
        </div>
      </details>

      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-green-700" : "text-sm font-semibold text-red-700"}>
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        <UserPlus size={16} />
        {pending ? "Creando..." : "Crear usuario"}
      </Button>
    </form>
  );
}
